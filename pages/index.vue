<template>
	<LayoutPage containerSize="large">
		<template #beforeRichtext>
			<div class="flex items-center lg:px-8">
				<div>
					<WrapBalancer as="h1"> Exceptional web experiences, crafted with passion. </WrapBalancer>
					<WrapBalancer as="p" class="PLargeLike !leading-normal mb-10 -mt-1">
						Hej! I am Fabian, a visual product designer and frontend developer, creating high-quality web
						experiences for your unique needs.
					</WrapBalancer>
					<div class="UIButtonGroup">
						<NuxtLink to="/#projects" external class="UIButton flex-1 md:flex-none">
							π¨πΌβπ»&nbsp;&nbsp;My Work
						</NuxtLink>
						<NuxtLink :to="{ name: 'contact' }" class="UIButton UIButton-secondary flex-1 md:flex-none">
							π¬&nbsp;&nbsp;Say hello!
						</NuxtLink>
					</div>
				</div>

				<div class="overflow-hidden shrink-0 w-0 lg:w-[240px] lg:-ml-[3vw]">
					<WPImage
						src="/wp-content/uploads/2023/02/avatar.svg"
						alt=""
						path="/wordpress-madebyfabian/"
						class="w-[7rem] -mr-[3rem] lg:-mr-0 lg:w-full aspect-[0.66]" />
				</div>
			</div>
		</template>

		<div id="projects" class="lg:px-8">
			<h2 class="H2-Like">Selected Projects <span class="font-normal"> βΒ what yours could look like.</span></h2>
			<LayoutProjectsList />
			<div class="flex justify-center">
				<NuxtLink class="UIButton UIButton-secondary" :to="{ name: 'contact' }"
					>π¬ Get in touch to see all!</NuxtLink
				>
			</div>
		</div>

		<div class="mt-16 md:mt-28 mx-auto max-w-3xl">
			<h2 class="mb-6 H2-Like lg:text-center">Recent Posts</h2>
			<p class="mb-8 lg:mb-16 PLike PLargeLike lg:text-center">
				Everything I think about, want to discuss β or just want to share.
			</p>
			<LayoutBlogList :uniqueKey="uri" />
			<div class="flex justify-center">
				<NuxtLink class="UIButton UIButton-secondary mt-6" :to="{ name: 'blog' }"> See all posts </NuxtLink>
			</div>
		</div>
	</LayoutPage>
</template>

<script setup lang="ts">
	const route = useRoute('index')
	const uri = computed(() => route.fullPath)
</script>
