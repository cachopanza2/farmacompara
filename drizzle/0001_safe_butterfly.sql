CREATE TABLE `farmacias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(100) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`url_base` varchar(255) NOT NULL,
	`url_busqueda` varchar(255) NOT NULL,
	`color` varchar(20) NOT NULL DEFAULT '#1B3A6B',
	`activa` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `farmacias_id` PRIMARY KEY(`id`),
	CONSTRAINT `farmacias_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `precios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`producto_id` int NOT NULL,
	`farmacia_id` int NOT NULL,
	`nombre_en_farmacia` varchar(300) NOT NULL,
	`url_producto` varchar(500) NOT NULL,
	`precio_original` int,
	`precio_efectivo` int NOT NULL,
	`precio_qr` int,
	`porcentaje_descuento` int,
	`tiene_promocion` boolean NOT NULL DEFAULT false,
	`disponible` boolean NOT NULL DEFAULT true,
	`fecha_scraping` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `precios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre_normalizado` varchar(300) NOT NULL,
	`principio_activo` varchar(150),
	`presentacion` varchar(150),
	`categoria` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scraping_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmacia_id` int NOT NULL,
	`estado` enum('exitoso','error','en_progreso','pendiente') NOT NULL DEFAULT 'pendiente',
	`productos_encontrados` int NOT NULL DEFAULT 0,
	`productos_actualizados` int NOT NULL DEFAULT 0,
	`errores` int NOT NULL DEFAULT 0,
	`mensaje_error` text,
	`iniciado_en` timestamp NOT NULL DEFAULT (now()),
	`finalizado_en` timestamp,
	CONSTRAINT `scraping_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `precios` ADD CONSTRAINT `precios_producto_id_productos_id_fk` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `precios` ADD CONSTRAINT `precios_farmacia_id_farmacias_id_fk` FOREIGN KEY (`farmacia_id`) REFERENCES `farmacias`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scraping_logs` ADD CONSTRAINT `scraping_logs_farmacia_id_farmacias_id_fk` FOREIGN KEY (`farmacia_id`) REFERENCES `farmacias`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_producto_farmacia` ON `precios` (`producto_id`,`farmacia_id`);--> statement-breakpoint
CREATE INDEX `idx_fecha_scraping` ON `precios` (`fecha_scraping`);--> statement-breakpoint
CREATE INDEX `idx_farmacia` ON `precios` (`farmacia_id`);--> statement-breakpoint
CREATE INDEX `idx_nombre` ON `productos` (`nombre_normalizado`);