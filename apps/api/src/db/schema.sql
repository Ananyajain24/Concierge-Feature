CREATE TABLE IF NOT EXISTS "destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"timezone" text NOT NULL,
	"bbox" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "destinations_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "villas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"bedrooms" integer NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"hero_image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "villas_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "pois" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"vibe_tags" text[] DEFAULT '{}' NOT NULL,
	"price_band" text NOT NULL,
	"avg_duration_min" integer NOT NULL,
	"opening_hours" jsonb NOT NULL,
	"seasonality" jsonb NOT NULL,
	"kid_friendly" boolean DEFAULT true NOT NULL,
	"bookable" boolean DEFAULT false NOT NULL,
	"concierge_note" text DEFAULT '' NOT NULL,
	"quality_score" real DEFAULT 0.7 NOT NULL,
	"booking_url" text,
	"photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "poi_distances" (
	"from_id" uuid NOT NULL,
	"from_kind" text NOT NULL,
	"to_id" uuid NOT NULL,
	"to_kind" text NOT NULL,
	"meters" integer NOT NULL,
	"seconds" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "poi_distances_from_id_to_id_pk" PRIMARY KEY("from_id","to_id")
);

CREATE TABLE IF NOT EXISTS "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"villa_id" uuid NOT NULL,
	"guest_name" text NOT NULL,
	"check_in" date NOT NULL,
	"check_out" date NOT NULL,
	"party_size" integer NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_token_unique" UNIQUE("token")
);

CREATE TABLE IF NOT EXISTS "guest_preferences" (
	"booking_id" uuid PRIMARY KEY NOT NULL,
	"answers" jsonb NOT NULL,
	"derived_tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "itineraries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"sla_due_at" timestamp with time zone,
	"prompt_version" text,
	"model" text,
	"cost_usd" real DEFAULT 0 NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"days" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"published_snapshot" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "itinerary_edits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"itinerary_id" uuid NOT NULL,
	"actor" text NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"reason_code" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_run_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "map_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_id" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"image_url" text NOT NULL,
	"transform" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "booking_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"itinerary_id" uuid NOT NULL,
	"stop_id" text NOT NULL,
	"poi_id" uuid,
	"url" text NOT NULL,
	"clicked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "villas" ADD CONSTRAINT "villas_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pois" ADD CONSTRAINT "pois_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_villa_id_villas_id_fk" FOREIGN KEY ("villa_id") REFERENCES "public"."villas"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "guest_preferences" ADD CONSTRAINT "guest_preferences_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "itinerary_edits" ADD CONSTRAINT "itinerary_edits_itinerary_id_itineraries_id_fk" FOREIGN KEY ("itinerary_id") REFERENCES "public"."itineraries"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "map_assets" ADD CONSTRAINT "map_assets_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "booking_leads" ADD CONSTRAINT "booking_leads_itinerary_id_itineraries_id_fk" FOREIGN KEY ("itinerary_id") REFERENCES "public"."itineraries"("id") ON DELETE cascade ON UPDATE no action;
