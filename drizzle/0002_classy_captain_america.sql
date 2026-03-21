CREATE TABLE `emailForwardings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`senderEmail` varchar(320) NOT NULL,
	`senderName` varchar(256),
	`companyName` varchar(256),
	`subject` varchar(512),
	`emailBody` text NOT NULL,
	`suspiciousHooks` text,
	`verdict` varchar(64),
	`analysis` text,
	`status` enum('pending','analyzing','completed','archived') NOT NULL DEFAULT 'pending',
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`analyzedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailForwardings_id` PRIMARY KEY(`id`)
);
