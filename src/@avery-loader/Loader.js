import GlobalHandler from '../components/GlobalHandler';
import NodeEmitter from '../classes/NodeEmitter';

import each from 'lodash/each';
import map from 'lodash/map';

// import Preloader from './Preloader';
import Router from './CustomRouter';

import { htmlWithoutPin, getPathFromURL, normalizeUrl } from './utils';
import { update } from 'lodash';

// pages = [{ page: this.home, url: ['/', '/home'] }];
export default class Loader extends NodeEmitter {
	constructor({
		pages,
		canvas,
		preloader,
		onLeave,
		onEnter,
		beforeEnter,
		afterEnter,
		onPreloaded,
	}) {
		super();

		this.cache = {}; // Stores page content

		// Callbacks
		this.onLeave = async () => {
			GlobalHandler.handleDestroy();
			if (typeof onLeave === 'function') await onLeave();
		};

		this.beforeEnter = async () => {
			if (typeof beforeEnter === 'function') await beforeEnter();
		};

		this.onEnter = async () => {
			GlobalHandler.setTemplate = this.template;
			if (typeof onEnter === 'function') await onEnter();
		};

		this.afterEnter = async () => {
			console.log('AFTER ENTER ✌🏻');
			GlobalHandler.handlePageTemplate(); // sets this.template on all pages

			GlobalHandler.handleCreate(); // Run create() on each page
			GlobalHandler.handleResize(); // Runs onResize() on each component

			if (typeof afterEnter === 'function') await afterEnter();
		};

		this.onPreloaded = async () => {
			if (typeof onPreloaded === 'function') await onPreloaded();
		};

		this.pages = this.generateLocaleUrls(pages); // each page has a class and url(s)

		this.preloader = preloader; // allows using custom preloader

		this.content = document.querySelector('.content');

		this.wrapper = this.content.parentElement;

		this.template = this.content.getAttribute('data-template');
		GlobalHandler.setTemplate = this.template;

		this.wrapper.setAttribute('data-page', this.template);

		this.current = {
			page: null,
			url: null,
		}; // current page

		this.next = {
			page: null,
			url: null,
		}; // next page

		this.page404 = this.findPageObjectByPath('/404');
		if (!this.page404) console.warn('No 404 page found!');

		this.current = this.pickPage();

		this.linksAdded = [];
		this.addLinkListeners();
		this.addEventListeners();

		// Once everything is loaded, save page to cache
		this.router = new Router(this);

		// Adds loaded page to the cache
		// this.preloader.on('completed', this.savePageToCache.bind(this)); @TODO
		// this.preloader.on('completed', this.onPreloaded.bind(this));
		this.$on('onPreloaded', this.onPreloaded.bind(this));

		this.clickedTheLink = false;
		this.isChanging = false;

		console.log(`New Loader`);
	}

	/**
	 * PAGES
	 */
	generateLocaleUrls(pages) {
		if (!LOCALES) return pages;
		console.log(LOCALES);

		const updatedPages = map(pages, (page) => {
			const { url } = page;
			let localeUrls = [];

			const addLocaleUrls = (baseUrl) => {
				each(LOCALES, (locale) => {
					if (baseUrl === '/') {
						localeUrls.push(`/${locale.code}`, `/${locale.code}/`);
						localeUrls.push(`/${locale.code}`, '');
					} else {
						localeUrls.push(
							`/${locale.code}${baseUrl}`,
							`/${locale.code}${baseUrl}/`
						);
					}
				});
			};

			if (Array.isArray(url)) {
				url.forEach((baseUrl) => {
					// Add base URL with and without trailing slash
					localeUrls.push(baseUrl, `${baseUrl}/`);
					addLocaleUrls(baseUrl);
				});
			} else {
				// Add base URL with and without trailing slash
				localeUrls.push(url, `${url}/`);
				addLocaleUrls(url);
			}

			return { ...page, url: [...localeUrls] };
		});

		console.log(updatedPages);
		return updatedPages;
	}

	normalizeUrl(url) {
		return url.endsWith('/') ? url.slice(0, -1) : url;
	}

	findPageObjectByPath(path) {
		return this.pages.find((pageObject) => pageObject.url.includes(path));
	}

	pickPage(url = window.location.href) {
		const path = getPathFromURL(url);
		const currentPage = this.findPageObjectByPath(path);

		if (!currentPage) {
			console.log('No page found! Returning 404.');
			return this.page404;
		}

		console.log('currentPage', currentPage);

		return currentPage;
	}

	savePageToCache() {
		const path = getPathFromURL(window.location.href);

		if (!this.cache[path]) {
			const wrapperhtml = htmlWithoutPin(this.wrapper); // removes .pin-spacer from clonedDoc
			this.cache[path] = wrapperhtml; // saves html without pin-spacer
		}
	}

	/**
	 * LISTENERS
	 */

	// <a> tag elements
	checkIfSamePage(current, clicked) {
		const foundPage = this.findPageObjectByPath(clicked.path);
		if (!foundPage) {
			console.warn('No page found');
			return false;
		}

		console.log(this.current, foundPage);
		if (this.current.page.id === foundPage.page.id) return true;
		else return false;
	}

	clickLink(event) {
		if (this.clickedTheLink || this.isChanging) return;

		this.clickedTheLink = true;

		function findLinkElement(element) {
			if (!element) return console.warn(`No element found.`);
			if (element.href) return { html: element.href, element: element };
			if (element.getAttribute('data-element-link'))
				return { html: 'SAMEPAGE', element: element };
			return findLinkElement(element.parentElement);
		}

		const linkElement = findLinkElement(event.target);
		const elementWithHref = linkElement.element;
		const href = linkElement.html;

		const clickedLinkPath = new URL(href, window.location.origin).pathname;
		const currentPath = window.location.pathname;

		// Create a regex pattern from the LOCALES array
		const localePattern =
			LOCALES && LOCALES.length > 0
				? LOCALES.map((locale) => locale.code).join('|')
				: [];
		const regex = new RegExp(`^/(${localePattern})(/.*)?$`);

		// Extract locale and path
		const extractLocaleAndPath = (url) => {
			const match = url.match(regex);
			return match
				? { locale: match[1], path: normalizeUrl(match[2] || '/') }
				: { locale: '', path: normalizeUrl(url) };
		};

		const current = extractLocaleAndPath(currentPath);
		const clicked = extractLocaleAndPath(clickedLinkPath);

		// let isSamePage =
		// 	current.locale === clicked.locale && current.path === clicked.path;
		let isSamePage = this.checkIfSamePage(current, clicked);

		console.log('current', current);
		console.log('clicked', clicked);
		console.log('isSamePage', isSamePage);

		if (isSamePage) {
			// Scroll to an element if required
			this.clickedTheLink = false;
			this.$emit('resetState');
			const dataElementLink = elementWithHref.getAttribute('data-element-link');
			if (dataElementLink) {
				return this.$emit('scrollTo', dataElementLink);
			}
		} else if (elementWithHref.hasAttribute('data-page-link')) {
			const websiteUrl = window.location.origin;
			const thePath = getPathFromURL(href);
			let addLocaleString =
				current.locale && current.locale.length > 0 ? `${current.locale}` : '';

			// if addLocaleString doesn't start with "/" add "/"
			if (addLocaleString && !addLocaleString.startsWith('/')) {
				addLocaleString = `/${addLocaleString}`;
			}

			const newUrl = `${websiteUrl}${addLocaleString}${thePath}`;

			// Change the page or scroll to an element on the new page
			this.onChange({
				url: newUrl,
				scrollTo: elementWithHref.getAttribute('data-element-link'),
			});
		}
	}

	linkClickHandler() {}

	addLinkListeners() {
		this.links = document.querySelectorAll('[data-page-link]'); // page links must have [data-page-link]
		this.linksElements = document.querySelectorAll('[data-element-link]'); // page links must have [data-page-link]
		console.log(this.links);

		each([this.links, this.linksElements], (links) => {
			each(links, (link) => {
				if (this.linksAdded.includes(link)) return;

				this.linksAdded.push(link);
				link.addEventListener('click', (e) => {
					e.preventDefault();
					if (this.clickedTheLink) return;
					this.clickLink(e);
				});
			});
		});
	}

	removeLinkListeners() {
		each([this.links, this.linksElements], (links) => {
			each(links, (link) => {
				link.removeEventListener('click', (e) => {
					e.preventDefault();
					if (this.clickedTheLink) return;
					this.clickLink(e);
				});
			});
		});

		this.links = null;
	}

	// onPopState
	onPopState(e) {
		this.onChange({ url: window.location.pathname, push: false });
	}

	addEventListeners() {
		window.addEventListener('popstate', this.onPopState.bind(this));
		window.addEventListener('DOMContentLoaded', (event) => {
			setTimeout(() => {
				console.log(window.location.hash);
				this.emit('scrollToCentered', window.location.hash);
			}, 1000);
		});
	}

	/**
	 * CHANGE EVENT
	 */
	async onChange({ url, push = true, scrollTo }) {
		if (window.location.href === url) return (this.clickedTheLink = false); // Same Page

		if (url.includes('?id=')) {
			const id = window.location.href.split('?id=')[1];
			this.emit('scrollToCentered', id);
			return (this.clickedTheLink = false);
		}

		if (url.includes('#')) {
			const id = window.location.href.split('#')[1];
			this.emit('scrollToCentered', id);
			return (this.clickedTheLink = false);
		}

		// await this.preloader.show();

		// Lead to the cached page
		// @TODO fix [data-pre] related bug
		// @TODO Web Worker to store cached images
		// if (this.cache[url]) {
		// 	return this.navigate({
		// 		cachedHtml: this.cache[url],
		// 		url,
		// 		push,
		// 	});
		// }

		// Or make a new request
		const request = await window.fetch(url);

		if (request.status === 200) {
			this.navigate({
				request,
				url,
				push,
				scrollTo,
			});
		} else {
			console.error('Error', 'Error while fetching the page content');
			window.location.href = '/404';
			this.clickedTheLink = false;

			// const request = await window.fetch('/404');
			// if (request.status === 200) {
			// 	this.navigate({
			// 		request,
			// 		url,
			// 		push,
			// 	});
			// }
			// this.preloader.hide();
		}
	}

	// Idea:
	// onLeave -> clearDOM -> beforeEnter -> addDOM -> onEnter -> createLoader -> afterEnter -> push history
	async navigate({ url, request, cachedHtml, push = true, scrollTo }) {
		if (!request & !cachedHtml)
			return console.error('Critical Error! No request or cache attached.');

		console.log(this.onLeave);

		await this.onLeave(); // ⚠ onLeave
		console.log('forward --->');
		this.isChanging = true;

		this.router.destroyCurrentPage(); // Runs destroy() method on the page class

		let html = cachedHtml ? cachedHtml : await request.text(); // Gets HTML from cache or request

		const newPage = this.router.createNewPage(html); // { page, content, template, images }

		console.log(newPage);
		this.router.content = newPage;
		// this.preloader.selectorChildren.images = newPage.images; // Updating the preloader selector
		// this.preloader.createComponent();

		this.router.removeContentFromDOM(); // Removes old .content class from DOM

		await this.beforeEnter(); // ⚠ beforeEnter

		this.template = newPage.content.getAttribute('data-template');

		this.router.addContentToDOM(newPage); // Adds new .content into DOM

		await this.onEnter(); // ⚠ onEnter

		// Creates the page
		this.current = this.pickPage(url);

		this.addLinkListeners();

		await this.afterEnter(); // ⚠ afterEnter

		// this.preloader.createLoader(newPage.template);

		if (push) {
			window.history.pushState({}, '', url);
		}

		this.isChanging = false;
		this.clickedTheLink = false;

		if (scrollTo) this.$emit('scrollTo', scrollTo);
	}

	start() {
		// this.onEnter();
		GlobalHandler.setTemplate = this.template;

		// this.afterEnter();
		GlobalHandler.handlePageTemplate(); // sets this.template on all pages

		GlobalHandler.handleCreate(); // Run create() on each page
		GlobalHandler.handleResize(); // Runs onResize() on each component
	}
}
