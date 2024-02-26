import GSAP from 'gsap';
import each from 'lodash/each';

import Page from '@averyano/core/classes/Page';
import CoverSection from './CoverSection';
import GallerySection from './GallerySection';

export default class HomePage extends Page {
	constructor() {
		super({
			element: '.home',
			elements: {},
		});

		this.id = 'home';
		this.isCreated = false;
	}

	create() {
		console.log('🔼 Create Home Page', this.template);
		if (this.template != this.id) return;
		if (!this.isReady) super.createComponent();
		if (!this.isCreated) {
			this.components = {
				cover: new CoverSection(),
				gallery: new GallerySection(),
			};
			this.isCreated = true;
		}

		super.create();

		// window.$ga.trackEvent('Page View', {
		// 	action: 'Visit',
		// 	label: '/' + this.id,
		// });

		console.log(`🔼 ${this.id} is created`);
	}

	show() {
		console.log('🔼 Show Home Page');
		each(this.components, (component) => {
			console.log(component);
			if (component.show) component.show();
		});
	}

	hide() {
		return new Promise((resolve) => {
			GSAP.to(this.element, {
				autoAlpha: 0,
				duration: 0.5,
				onComplete: resolve,
			});
		});
	}
}
