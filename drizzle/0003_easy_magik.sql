CREATE TABLE `credibilitySearches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`query` varchar(512) NOT NULL,
	`verdict` varchar(64),
	`credibilityScore` int,
	`summary` text,
	`sources` text,
	`fullAnalysis` text,
	`status` enum('pending','completed','archived') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `credibilitySearches_id` PRIMARY KEY(`id`)
);
