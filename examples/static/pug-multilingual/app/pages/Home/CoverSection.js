import Component from '@averyano/core/classes/Component';
import GSAP from 'gsap';

export default class CoverSection extends Component {
	constructor() {
		super({
			element: '.cover',
			elements: {
				title: '.cover__title',
			},
		});
	}

	create() {
		console.log('💥 create CoverSection');
		super.createComponent();

		this.timeline = GSAP.timeline({ paused: true });
		this.timeline.to(
			this.elements.title,
			{
				autoAlpha: 1,
				duration: 1.5,
			},
			0
		);
	}

	addEventListeners() {}

	removeEventListeners() {}

	show() {
		this.timeline.play();
		console.log('🔼 Show Cover Section');
	}

	hide() {
		return new Promise((resolve) => {
			this.destroy();

			GSAP.to(this.element, {
				autoAlpha: 0,
				onComplete: resolve,
			});
		});
	}

	destroy() {
		super.destroy();
	}
}
