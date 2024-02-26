import Component from '../classes/Component';
import GlobalHandler from '../components/GlobalHandler';
import GSAP from 'gsap';
export default class Preloader extends Component {
	constructor() {
		super({
			element: document.querySelector('.preloader'),
			elements: {
				loadingbar: '.preloader__loadingbar',
				images: document.querySelectorAll('[data-pre]'),
				logo: '.preloader__logo',
			},
		});

		this.isComplete = false;
		this.firstReveal = true;
		this.isIntroComplete = 0;

		this.onResize();
		GlobalHandler.registerResize(this.onResize.bind(this));
	}

	/**
	 * LOADER
	 */
	// called from Loader
	createLoader(template) {
		if (template === '404') return (this.isLoaded = true);
		this.length = 0;

		if (this.elements.images.length > 0)
			this.elements.images.forEach((img) => {
				this.loadImage(img);
			});

		if (this.elements.images.length === 0) {
			this.timer = setTimeout(this.onLoaded.bind(this), 100);
			console.log('No Images to load');
		}
	}

	animateLine(number, onComplete = null) {
		GSAP.killTweensOf(this.elements.loadingbar);
		GSAP.to(this.elements.loadingbar, {
			duration: 1,
			scaleX: number,
			ease: 'power2.out',
			onComplete: onComplete,
		});
	}

	/**
	 * IMAGE LOADING
	 */
	loadImage(img) {
		if (img.tagName.toLowerCase() === 'img') {
			const boundOnAssetLoaded = this.onAssetLoaded.bind(this);
			img.addEventListener('load', boundOnAssetLoaded);

			img.onload = function () {
				img.removeEventListener('load', boundOnAssetLoaded);
			};

			const imageUrl =
				GlobalHandler.isWebpSupported && img.getAttribute('data-pre-webp')
					? img.getAttribute('data-pre-webp')
					: img.getAttribute('data-pre');
			img.src = imageUrl;
		} else {
			// other tags (for background image)
			const imageUrl =
				GlobalHandler.isWebpSupported && img.getAttribute('data-pre-webp')
					? img.getAttribute('data-pre-webp')
					: img.getAttribute('data-pre');

			const tempImage = new Image();
			tempImage.onload = () => {
				img.style.backgroundImage = `url(${imageUrl})`;
				this.onAssetLoaded();
				tempImage.onload = null; // optional, goes to garbage collection anyways
			};

			tempImage.src = imageUrl;
		}
	}

	onAssetLoaded() {
		this.length++;
		let imageLength = 0;

		if (this.elements.images) {
			imageLength += this.elements.images.length;
		}

		const percent = this.length / imageLength;

		this.elements.loadingbar.dataset.loaded = percent;

		this.animateLine(percent * 0.92);

		if (percent === 1) {
			this.isLoaded = true;

			if (this.timer) clearTimeout(this.timer);
			this.timer = setTimeout(this.onLoaded.bind(this), 1000);
		}
	}

	onLoaded() {
		this.animateLine(1, () => {
			this.animateAndComplete();
			// this.emit('completed');
			// console.log('Preloader completed');
		});
	}

	animateAndComplete() {
		GSAP.to(this.elements.loadingbar, {
			duration: 1.2,
			height: '100%',
			transformOrigin: 'top',
			ease: 'expo.out',
			onComplete: () => {
				this.isComplete = true;
				this.emit('completed');

				this.elements.loadingbar.style.top = 'auto';
				this.elements.loadingbar.style.bottom = '0';

				GSAP.to(this.elements.loadingbar, {
					duration: 1.2,
					height: '0%',
					transformOrigin: 'bottom',
					ease: 'expo.out',
					// onComplete: () => {
					// 	this.elements.logo.style.opacity = 0;
					// },
				});
			},
		});
	}

	show() {
		return new Promise((resolve) => {
			console.log('show preloader');
			GSAP.set(this.elements.loadingbar, {
				transformOrigin: 'left',
				height: 24,
				scaleX: 0,
				top: 0,
				bottom: 'auto',
			});
			GSAP.to(this.element, {
				duration: 0.5,
				opacity: 1,
				ease: 'power2.out',
				onComplete: () => resolve(),
			});
		});
	}

	hide() {
		GSAP.to(
			this.element,
			{
				duration: 0.5,
				opacity: 0,
				ease: 'power2.out',
				onComplete: () => {
					this.destroy();
				},
			},
			'>'
		);
	}

	destroy() {
		// this.element.parentNode.removeChild(this.element);
	}

	onResize() {}
}
