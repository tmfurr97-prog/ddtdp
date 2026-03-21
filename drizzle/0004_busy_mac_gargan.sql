CREATE TABLE `scamSenderEmails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`reportCount` int NOT NULL DEFAULT 1,
	`scamType` varchar(128),
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`description` text,
	`lastReportedAt` timestamp NOT NULL DEFAULT (now()),
	`flaggedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scamSenderEmails_id` PRIMARY KEY(`id`),
	CONSTRAINT `scamSenderEmails_email_unique` UNIQUE(`email`)
);
