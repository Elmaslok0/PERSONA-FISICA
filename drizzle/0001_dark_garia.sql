CREATE TABLE `buro_consultations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`rfc` varchar(13) NOT NULL,
	`birthDate` varchar(10) NOT NULL,
	`address` text NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(100) NOT NULL,
	`postalCode` varchar(5) NOT NULL,
	`status` enum('pending','authenticated','completed','failed') NOT NULL DEFAULT 'pending',
	`authenticationData` text,
	`reportData` text,
	`incomeEstimate` text,
	`prospectorData` text,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `buro_consultations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `buro_consultations` ADD CONSTRAINT `buro_consultations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;