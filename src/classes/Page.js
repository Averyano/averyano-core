import Component from './Component';
import GlobalHandler from '../components/GlobalHandler';
import each from 'lodash/each';

export default class Page extends Component {
	constructor(object) {
		super(object); // { element, elements }

		this.setTemplate();

		GlobalHandler.registerPage(this.setTemplate.bind(this));
		GlobalHandler.registerCreate(this.create.bind(this));
	}

	create() {
		super.createComponent();

		each(this.components, (component) => {
			component.create();
		});
	}

	show() {}

	hide() {
		return new Promise((resolve) => {
			this.destroy();
		});
	}

	setTemplate() {
		this.template = GlobalHandler.getTemplate;
	}

	addEventListeners() {
		each(this.components, (component) => {
			component.addEventListeners();
		});
	}

	removeEventListeners() {
		each(this.components, (component) => {
			component.removeEventListeners();
		});
	}

	destroy() {
		this.removeEventListeners();

		// Removes scroll trigger instances
		const scrolltriggerElements = document.querySelectorAll('.pin-spacer');
		each(scrolltriggerElements, (pinSpacer) => {
			const parent = pinSpacer.parentElement;

			while (pinSpacer.firstChild) {
				parent.appendChild(pinSpacer.firstChild);
			}

			parent.removeChild(pinSpacer);
		});

		// Destroys components
		each(this.components, (component) => {
			component.destroy();
		});

		super.destroy();
	}
}
