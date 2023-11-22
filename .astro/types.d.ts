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

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = never;
}
