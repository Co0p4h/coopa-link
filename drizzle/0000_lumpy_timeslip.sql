CREATE TABLE `links` (
	`id` integer PRIMARY KEY NOT NULL,
	`link` text NOT NULL,
	`redirect_to` text NOT NULL,
	`clicks` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `links_link_unique` ON `links` (`link`);