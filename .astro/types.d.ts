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

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

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
				import('astro/zod').ZodLiteral<'avif'>,
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
"accounting.md": {
	id: "accounting.md";
  slug: "accounting";
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
"assets.md": {
	id: "assets.md";
  slug: "assets";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"buying.md": {
	id: "buying.md";
  slug: "buying";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"car-dealership.md": {
	id: "car-dealership.md";
  slug: "car-dealership";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"car-repair.md": {
	id: "car-repair.md";
  slug: "car-repair";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"car-reservation.md": {
	id: "car-reservation.md";
  slug: "car-reservation";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"chat.md": {
	id: "chat.md";
  slug: "chat";
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
"courier.md": {
	id: "courier.md";
  slug: "courier";
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
"dairy.md": {
	id: "dairy.md";
  slug: "dairy";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"eCommerce.md": {
	id: "eCommerce.md";
  slug: "ecommerce";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"employee-lifecycle.md": {
	id: "employee-lifecycle.md";
  slug: "employee-lifecycle";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"erp.md": {
	id: "erp.md";
  slug: "erp";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"expenses.md": {
	id: "expenses.md";
  slug: "expenses";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"files.md": {
	id: "files.md";
  slug: "files";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"financial-assets.md": {
	id: "financial-assets.md";
  slug: "financial-assets";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"forms.md": {
	id: "forms.md";
  slug: "forms";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"freight.md": {
	id: "freight.md";
  slug: "freight";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"gym.md": {
	id: "gym.md";
  slug: "gym";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"healthcare.md": {
	id: "healthcare.md";
  slug: "healthcare";
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
"hr.md": {
	id: "hr.md";
  slug: "hr";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"incidents.md": {
	id: "incidents.md";
  slug: "incidents";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"insurance.md": {
	id: "insurance.md";
  slug: "insurance";
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
"law.md": {
	id: "law.md";
  slug: "law";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"learn.md": {
	id: "learn.md";
  slug: "learn";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"leave.md": {
	id: "leave.md";
  slug: "leave";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"library.md": {
	id: "library.md";
  slug: "library";
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
"non-profit.md": {
	id: "non-profit.md";
  slug: "non-profit";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"notes.md": {
	id: "notes.md";
  slug: "notes";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"payments.md": {
	id: "payments.md";
  slug: "payments";
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
"print-design.md": {
	id: "print-design.md";
  slug: "print-design";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"projects.md": {
	id: "projects.md";
  slug: "projects";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"property.md": {
	id: "property.md";
  slug: "property";
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
"recruitment.md": {
	id: "recruitment.md";
  slug: "recruitment";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"reports.md": {
	id: "reports.md";
  slug: "reports";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"salary.md": {
	id: "salary.md";
  slug: "salary";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"selling.md": {
	id: "selling.md";
  slug: "selling";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"shift-time-attendance.md": {
	id: "shift-time-attendance.md";
  slug: "shift-time-attendance";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"stock.md": {
	id: "stock.md";
  slug: "stock";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"support.md": {
	id: "support.md";
  slug: "support";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"tax-and-benefits.md": {
	id: "tax-and-benefits.md";
  slug: "tax-and-benefits";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"travel.md": {
	id: "travel.md";
  slug: "travel";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"veterinary.md": {
	id: "veterinary.md";
  slug: "veterinary";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"visa.md": {
	id: "visa.md";
  slug: "visa";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"website.md": {
	id: "website.md";
  slug: "website";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"whiteboard.md": {
	id: "whiteboard.md";
  slug: "whiteboard";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"wiki.md": {
	id: "wiki.md";
  slug: "wiki";
  body: string;
  collection: "apps";
  data: any
} & { render(): Render[".md"] };
"workflows.md": {
	id: "workflows.md";
  slug: "workflows";
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
