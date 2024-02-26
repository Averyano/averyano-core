// This file does nothing
import Avery from '@averyano/core';
import Preloader from './components/@avery-preloader';

import HomePage from './pages/Home';
import AboutPage from './pages/About';
import { Detection } from './components/@avery-detection';

class App {
	constructor() {
		this.createPages();
		this.createPreloader();
		this.init();
	}

	createPages() {
		this.home = new HomePage();
		this.about = new AboutPage();

		this.pages = [
			{
				page: this.home,
				url: ['/', '/home'],
			},
			{
				page: this.about,
				url: '/about',
			},
		];
	}

	createPreloader() {
		this.preloader = new Preloader();
	}

	init() {
		this.avery = new Avery({
			detection: Detection,
			loader: {
				preloader: this.preloader,
				pages: this.pages,
				onLeave: async () => {
					await this.avery.loader.current.page.hide();

					await this.preloader.show();
				},
				beforeEnter: async () => {
					this.preloader.selectorChildren.images =
						this.avery.loader.router.content.images;
					this.preloader.createComponent();
					await this.preloader.hide();
				},
				// onEnter: async () => {

				// },
				afterEnter: async () => {
					await this.avery.loader.current.page.show();
				},
				onPreloaded: async () => {
					console.log('🔼 Preloaded');
					// this.preloader.hide();
					await this.avery.loader.current.page.show();
				},
			},
			analytics: {
				firebase: {},
			},
		});
		this.id = document.querySelector('[data-page]').dataset.page;
		this.preloader.createLoader(this.id);

		this.avery.start();
		this.avery.loader.current.page.show();
	}
}
new App();
