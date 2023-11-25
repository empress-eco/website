declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';

	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;
	export type CollectionEntry<C extends keyof AnyEntryMap> = Flatten<AnyEntryMap[C]>;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>,
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<[BaseSchemaWithoutEffects, ...BaseSchemaWithoutEffects[]]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<BaseSchemaWithoutEffects, BaseSchemaWithoutEffects>;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"apps": {
"account.md": {
	id: "account.md";
  slug: "account";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"appointments.md": {
	id: "appointments.md";
  slug: "appointments";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"approvals.md": {
	id: "approvals.md";
  slug: "approvals";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"assets.md": {
	id: "assets.md";
  slug: "assets";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"budget.md": {
	id: "budget.md";
  slug: "budget";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"campaign.md": {
	id: "campaign.md";
  slug: "campaign";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"carbon-footprint.md": {
	id: "carbon-footprint.md";
  slug: "carbon-footprint";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"content.md": {
	id: "content.md";
  slug: "content";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"contracts.md": {
	id: "contracts.md";
  slug: "contracts";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"crm.md": {
	id: "crm.md";
  slug: "crm";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"directory.md": {
	id: "directory.md";
  slug: "directory";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"distribution.md": {
	id: "distribution.md";
  slug: "distribution";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"email.md": {
	id: "email.md";
  slug: "email";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"energy-efficiency.md": {
	id: "energy-efficiency.md";
  slug: "energy-efficiency";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"environmental-compliance.md": {
	id: "environmental-compliance.md";
  slug: "environmental-compliance";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"events.md": {
	id: "events.md";
  slug: "events";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"expense.md": {
	id: "expense.md";
  slug: "expense";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"facilities.md": {
	id: "facilities.md";
  slug: "facilities";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"feedback.md": {
	id: "feedback.md";
  slug: "feedback";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"forum.md": {
	id: "forum.md";
  slug: "forum";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"fulfillment.md": {
	id: "fulfillment.md";
  slug: "fulfillment";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"governance-and-ethics.md": {
	id: "governance-and-ethics.md";
  slug: "governance-and-ethics";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"helpdesk.md": {
	id: "helpdesk.md";
  slug: "helpdesk";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"inventory.md": {
	id: "inventory.md";
  slug: "inventory";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"invoice.md": {
	id: "invoice.md";
  slug: "invoice";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"invoicing.md": {
	id: "invoicing.md";
  slug: "invoicing";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"lifecycle.md": {
	id: "lifecycle.md";
  slug: "lifecycle";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"live-chat.md": {
	id: "live-chat.md";
  slug: "live-chat";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"logistics.md": {
	id: "logistics.md";
  slug: "logistics";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"loyalty.md": {
	id: "loyalty.md";
  slug: "loyalty";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"maintenance.md": {
	id: "maintenance.md";
  slug: "maintenance";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"manufacturing.md": {
	id: "manufacturing.md";
  slug: "manufacturing";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"payroll.md": {
	id: "payroll.md";
  slug: "payroll";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"performance.md": {
	id: "performance.md";
  slug: "performance";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"pos.md": {
	id: "pos.md";
  slug: "pos";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"procurement.md": {
	id: "procurement.md";
  slug: "procurement";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"production.md": {
	id: "production.md";
  slug: "production";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"purchase-orders.md": {
	id: "purchase-orders.md";
  slug: "purchase-orders";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"quality.md": {
	id: "quality.md";
  slug: "quality";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"quotes.md": {
	id: "quotes.md";
  slug: "quotes";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"recruit.md": {
	id: "recruit.md";
  slug: "recruit";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"rentals.md": {
	id: "rentals.md";
  slug: "rentals";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"social-responsibility.md": {
	id: "social-responsibility.md";
  slug: "social-responsibility";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"social.md": {
	id: "social.md";
  slug: "social";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"surveys.md": {
	id: "surveys.md";
  slug: "surveys";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"sustainability.md": {
	id: "sustainability.md";
  slug: "sustainability";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"sustainable-supply-chain.md": {
	id: "sustainable-supply-chain.md";
  slug: "sustainable-supply-chain";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"tax.md": {
	id: "tax.md";
  slug: "tax";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"training.md": {
	id: "training.md";
  slug: "training";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
};
"integrations": {
"activecampaign.md": {
	id: "activecampaign.md";
  slug: "activecampaign";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"airtable.md": {
	id: "airtable.md";
  slug: "airtable";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"amplitude.md": {
	id: "amplitude.md";
  slug: "amplitude";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"asana.md": {
	id: "asana.md";
  slug: "asana";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"baremetrics.md": {
	id: "baremetrics.md";
  slug: "baremetrics";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"basecamp.md": {
	id: "basecamp.md";
  slug: "basecamp";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"big-commerce.md": {
	id: "big-commerce.md";
  slug: "big-commerce";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"buffer.md": {
	id: "buffer.md";
  slug: "buffer";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"calendly.md": {
	id: "calendly.md";
  slug: "calendly";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"campignmonitor.md": {
	id: "campignmonitor.md";
  slug: "campignmonitor";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"captivate.md": {
	id: "captivate.md";
  slug: "captivate";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"chartmogul.md": {
	id: "chartmogul.md";
  slug: "chartmogul";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"churnbuster.md": {
	id: "churnbuster.md";
  slug: "churnbuster";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"circle.md": {
	id: "circle.md";
  slug: "circle";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"clickup.md": {
	id: "clickup.md";
  slug: "clickup";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"convertkit.md": {
	id: "convertkit.md";
  slug: "convertkit";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"coppercrm.md": {
	id: "coppercrm.md";
  slug: "coppercrm";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"cove.md": {
	id: "cove.md";
  slug: "cove";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"data-studio.md": {
	id: "data-studio.md";
  slug: "data-studio";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"discord.md": {
	id: "discord.md";
  slug: "discord";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"disqus.md": {
	id: "disqus.md";
  slug: "disqus";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"doodle.md": {
	id: "doodle.md";
  slug: "doodle";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"drift.md": {
	id: "drift.md";
  slug: "drift";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"email-octopus.md": {
	id: "email-octopus.md";
  slug: "email-octopus";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"facebook.md": {
	id: "facebook.md";
  slug: "facebook";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"fathom-analytics.md": {
	id: "fathom-analytics.md";
  slug: "fathom-analytics";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"firstpromotor.md": {
	id: "firstpromotor.md";
  slug: "firstpromotor";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"flock.md": {
	id: "flock.md";
  slug: "flock";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"freshdesk.md": {
	id: "freshdesk.md";
  slug: "freshdesk";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"ghost.md": {
	id: "ghost.md";
  slug: "ghost";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"github.md": {
	id: "github.md";
  slug: "github";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"gitlab.md": {
	id: "gitlab.md";
  slug: "gitlab";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"google-adsense.md": {
	id: "google-adsense.md";
  slug: "google-adsense";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"google-analytics.md": {
	id: "google-analytics.md";
  slug: "google-analytics";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"google-docs.md": {
	id: "google-docs.md";
  slug: "google-docs";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"google-forms.md": {
	id: "google-forms.md";
  slug: "google-forms";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"googleadmanager.md": {
	id: "googleadmanager.md";
  slug: "googleadmanager";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"groove.md": {
	id: "groove.md";
  slug: "groove";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"gumroad.md": {
	id: "gumroad.md";
  slug: "gumroad";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"heap.md": {
	id: "heap.md";
  slug: "heap";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"help-scout.md": {
	id: "help-scout.md";
  slug: "help-scout";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"helpjuice.md": {
	id: "helpjuice.md";
  slug: "helpjuice";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"hotjar.md": {
	id: "hotjar.md";
  slug: "hotjar";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"hubspot.md": {
	id: "hubspot.md";
  slug: "hubspot";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"instagram.md": {
	id: "instagram.md";
  slug: "instagram";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"intercom.md": {
	id: "intercom.md";
  slug: "intercom";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"intravert.md": {
	id: "intravert.md";
  slug: "intravert";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"kayako.md": {
	id: "kayako.md";
  slug: "kayako";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"keen-io.md": {
	id: "keen-io.md";
  slug: "keen-io";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"live-chat.md": {
	id: "live-chat.md";
  slug: "live-chat";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"looker.md": {
	id: "looker.md";
  slug: "looker";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"loom.md": {
	id: "loom.md";
  slug: "loom";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"mailchimp.md": {
	id: "mailchimp.md";
  slug: "mailchimp";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"mailer-lite.md": {
	id: "mailer-lite.md";
  slug: "mailer-lite";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"matomo.md": {
	id: "matomo.md";
  slug: "matomo";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"microsoft-teams.md": {
	id: "microsoft-teams.md";
  slug: "microsoft-teams";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"miro.md": {
	id: "miro.md";
  slug: "miro";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"mixpanel.md": {
	id: "mixpanel.md";
  slug: "mixpanel";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"monday.md": {
	id: "monday.md";
  slug: "monday";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"notion.md": {
	id: "notion.md";
  slug: "notion";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"patreon.md": {
	id: "patreon.md";
  slug: "patreon";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"paypal.md": {
	id: "paypal.md";
  slug: "paypal";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"pinterest.md": {
	id: "pinterest.md";
  slug: "pinterest";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"pipedrive.md": {
	id: "pipedrive.md";
  slug: "pipedrive";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"placid.md": {
	id: "placid.md";
  slug: "placid";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"plausible.md": {
	id: "plausible.md";
  slug: "plausible";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"powerbi.md": {
	id: "powerbi.md";
  slug: "powerbi";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"salesforce.md": {
	id: "salesforce.md";
  slug: "salesforce";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"segment.md": {
	id: "segment.md";
  slug: "segment";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"shopify.md": {
	id: "shopify.md";
  slug: "shopify";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"simple-analytics.md": {
	id: "simple-analytics.md";
  slug: "simple-analytics";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"slack.md": {
	id: "slack.md";
  slug: "slack";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"snipcart.md": {
	id: "snipcart.md";
  slug: "snipcart";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"stripe.md": {
	id: "stripe.md";
  slug: "stripe";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"tableau.md": {
	id: "tableau.md";
  slug: "tableau";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"talkyard.md": {
	id: "talkyard.md";
  slug: "talkyard";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"tidio.md": {
	id: "tidio.md";
  slug: "tidio";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"transistor.md": {
	id: "transistor.md";
  slug: "transistor";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"trello.md": {
	id: "trello.md";
  slug: "trello";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"typeform.md": {
	id: "typeform.md";
  slug: "typeform";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"vimeo.md": {
	id: "vimeo.md";
  slug: "vimeo";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"viralloops.md": {
	id: "viralloops.md";
  slug: "viralloops";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"weglot.md": {
	id: "weglot.md";
  slug: "weglot";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"x.md": {
	id: "x.md";
  slug: "x";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"youtube copy.md": {
	id: "youtube copy.md";
  slug: "youtube-copy";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"youtube.md": {
	id: "youtube.md";
  slug: "youtube";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"zapier.md": {
	id: "zapier.md";
  slug: "zapier";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"zendesk.md": {
	id: "zendesk.md";
  slug: "zendesk";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"zohocrm.md": {
	id: "zohocrm.md";
  slug: "zohocrm";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
"zoom.md": {
	id: "zoom.md";
  slug: "zoom";
  body: string;
  collection: "integrations";
  data: any
} & { render(): Render[".md"] };
};
"posts": {
"1.md": {
	id: "1.md";
  slug: "1";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2.md": {
	id: "2.md";
  slug: "2";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"3.md": {
	id: "3.md";
  slug: "3";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"4.md": {
	id: "4.md";
  slug: "4";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
