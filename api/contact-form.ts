import { createSSRApp, reactive } from 'vue'
import { renderToString } from 'vue/server-renderer'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GraphQLClient, gql as gqlUntyped } from 'graphql-request'
import { z } from 'zod'
import xss from 'xss'
import { fetch } from 'ofetch'

const renderBody = async ({ name, email, message }: { name: string; email: string; message: string }) => {
	const ssrInput = createSSRApp({
		setup() {
			const getMessage = () => {
				message = message.replace(/\n/g, '<br />')
				message = xss(message)
				return message
			}

			const input = reactive({
				name,
				email,
				message: getMessage(),
			})

			return { input }
		},
		template: `<div class="email" :class="{ 'dynamic': true }">
				<ul>
					<li v-for="(value, key) in input" :key="key">
						<div>{{ key }}: </div>
						<div style="{ font-weight: bold; }" v-html="value" />
					</li>
				</ul>
			</div>`,
	})

	return ((await renderToString(ssrInput)) || undefined) as any
}

// New
const verifyTurnstileToken = async (token: string) => {
	const endpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
	const res = await fetch(endpoint, {
		method: 'POST',
		body: `secret=${encodeURIComponent(process.env.NUXT_TURNSTILE_SECRET_KEY || '')}&response=${encodeURIComponent(
			token
		)}`,
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
		},
	})
	const json = await res.json()
	return json
}

// New
const graphQLClient = new GraphQLClient(process.env.NUXT_GQL_HOST || '', {
	headers: {
		authorization: process.env.NUXT_GQL_TOKEN || '',
	},
})

const getContactFormEmail = async () => {
	const query = gqlUntyped/* GraphQL */ `
		query AdminEmail {
			allSettings {
				generalSettingsEmail
			}
		}
	`
	return graphQLClient.request(query)
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
	try {
		// First validate input
		const schema = z.object({
			name: z.string(),
			email: z.string(),
			message: z.string(),
			turnstileToken: z.string(),
		})
		const input = schema.parse(request.body)

		const validationResponse = await verifyTurnstileToken(input.turnstileToken)
		if (!validationResponse.success)
			return response.status(401).json({
				error: 'Failed to verify the captcha token.',
			})

		const contactFormEmailRes = await getContactFormEmail()
		const contactFormEmail = contactFormEmailRes.allSettings?.generalSettingsEmail
		if (!contactFormEmail)
			return response.status(500).json({
				error: 'Failed to get the receivers email adress from wp.',
			})

		const renderedBody = await renderBody({
			name: input.name,
			email: input.email,
			message: input.message,
		})
		if (!renderedBody)
			return response.status(500).json({
				error: 'Failed to render the email body.',
			})

		const admin = `Admin <${contactFormEmail}>`
		const mutation = gqlUntyped/* GraphQL */ `
			mutation SendEmail($input: SendEmailInput!) {
				sendEmail(input: $input) {
					sent
					message
				}
			}
		`

		const sendEmailRes = await graphQLClient.request(mutation, {
			input: {
				to: admin,
				from: admin,
				replyTo: `${input.name} <${input.email}>`,
				subject: 'New contact form request!',
				body: renderedBody,
			},
		})
		if (!sendEmailRes?.sendEmail?.sent)
			return response.status(500).json({
				error: 'Failed to send the email.',
			})

		return response.status(200).json(sendEmailRes)
	} catch (error) {
		return response.status(500).json({
			error: 'Something went wrong.',
		})
	}
}