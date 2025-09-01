-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Сен 01 2025 г., 19:24
-- Версия сервера: 10.8.4-MariaDB
-- Версия PHP: 8.1.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `social_network`
--

-- --------------------------------------------------------

--
-- Структура таблицы `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `comments`
--

INSERT INTO `comments` (`id`, `post_id`, `user_id`, `content`, `created_at`, `updated_at`) VALUES
(1, 1, 6, 'боже, даже аву не поставил', '2025-05-23 00:25:55', '2025-05-23 00:25:55'),
(2, 2, 8, 'лайков не будет', '2025-05-23 00:28:31', '2025-05-23 00:28:31'),
(3, 2, 6, 'будет <3', '2025-05-23 00:37:23', '2025-05-23 00:37:23'),
(4, 1, 6, 'бот\\n', '2025-05-23 10:52:36', '2025-05-23 10:52:36');

-- --------------------------------------------------------

--
-- Структура таблицы `friendships`
--

CREATE TABLE `friendships` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `friend_id` int(11) NOT NULL,
  `status` enum('pending','accepted','declined') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `friendships`
--

INSERT INTO `friendships` (`id`, `user_id`, `friend_id`, `status`, `created_at`, `updated_at`) VALUES
(6, 8, 6, 'accepted', '2025-05-23 00:42:51', '2025-05-23 00:42:55');

-- --------------------------------------------------------

--
-- Структура таблицы `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`) VALUES
(1, 6, 8, 'привет еклм, пошли играть', 1, '2025-05-23 00:43:10'),
(2, 8, 6, 'давай ееклмн', 1, '2025-05-23 00:43:20'),
(3, 6, 8, 'го го го', 1, '2025-05-23 00:43:41'),
(4, 6, 8, 'я такую топ тактику пропила знаю', 1, '2025-05-23 00:44:01'),
(5, 6, 8, 'при', 0, '2025-05-23 10:32:53'),
(6, 6, 8, 'привет', 0, '2025-05-23 10:32:57'),
(7, 6, 8, 'приветтттт', 0, '2025-05-23 10:33:12'),
(8, 6, 8, 'привет', 0, '2025-05-23 10:33:22'),
(9, 6, 8, 'Электронный охранный документ (патент или свидетельство) будет доступен по \\nнижеуказанной ссылке после регистрации объекта интеллектуальной собственности в \\nсоответствующем государственном реестре:', 0, '2025-05-23 10:34:26');

-- --------------------------------------------------------

--
-- Структура таблицы `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `original_post_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `original_post_id`, `created_at`, `updated_at`) VALUES
(1, 6, 'привет', NULL, NULL, '2025-05-23 00:16:41', '2025-05-23 00:16:41'),
(2, 8, 'да ничего нового, в радугу играю\\n', 'https://i.pinimg.com/736x/8e/28/4f/8e284f2bc83aeb12fa4dab73b9e51191.jpg', NULL, '2025-05-23 00:28:10', '2025-05-23 00:28:10'),
(3, 6, 'Поделился постом', NULL, 2, '2025-05-23 00:37:33', '2025-05-23 00:37:33'),
(4, 6, 'првиет', NULL, NULL, '2025-05-23 16:21:27', '2025-05-23 16:21:27'),
(5, 6, 'в', 'https://scontent-ams2-1.cdninstagram.com/v/t51.2885-15/499855351_18404643712105242_6632782493043547006_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjE0NDB4MTgwMC5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=scontent-ams2-1.cdninstagram.com&_nc_cat=106&_nc_oc=Q6cZ2QGHYnmuuzqxjVN_HhUEm9ssTnPycvgS5UfW9i0mvluIEcd0ATvkzxypyjVe-TydDAVASf7ZU0NZKYGUxEs_rH21&_nc_ohc=Ylx-tMGwIZAQ7kNvwFBVOj0&_nc_gid=s_UZe68B8TE8f2S1XSgUNQ&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzYzNzU1MzA3OTQ0MDk1MzQ0MQ%3D%3D.3-ccb7-5&oh=00_AfJDrob9uuSyPbe0_I5TvN_zidhEn2MOHXhUfMKRK5Ckkw&oe=68366BF1&_nc_sid=10d13b', NULL, '2025-05-23 16:51:48', '2025-05-23 16:51:48'),
(6, 6, 'в', 'https://scontent-ams2-1.cdninstagram.com/v/t51.2885-15/499855351_18404643712105242_6632782493043547006_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjE0NDB4MTgwMC5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=scontent-ams2-1.cdninstagram.com&_nc_cat=106&_nc_oc=Q6cZ2QGHYnmuuzqxjVN_HhUEm9ssTnPycvgS5UfW9i0mvluIEcd0ATvkzxypyjVe-TydDAVASf7ZU0NZKYGUxEs_rH21&_nc_ohc=Ylx-tMGwIZAQ7kNvwFBVOj0&_nc_gid=s_UZe68B8TE8f2S1XSgUNQ&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzYzNzU1MzA3OTQ0MDk1MzQ0MQ%3D%3D.3-ccb7-5&oh=00_AfJDrob9uuSyPbe0_I5TvN_zidhEn2MOHXhUfMKRK5Ckkw&oe=68366BF1&_nc_sid=10d13b', NULL, '2025-05-23 16:51:56', '2025-05-23 16:51:56'),
(7, 6, 'с', 'https://i.pinimg.com/736x/8e/28/4f/8e284f2bc83aeb12fa4dab73b9e51191.jpg', NULL, '2025-05-23 16:52:16', '2025-05-23 16:52:16'),
(8, 6, 'в', 'https://i.pinimg.com/736x/8e/28/4f/8e284f2bc83aeb12fa4dab73b9e51191.jpg', NULL, '2025-05-23 16:54:47', '2025-05-23 16:54:47'),
(9, 6, 'фв', 'https://scontent-ams2-1.cdninstagram.com/v/t51.2885-15/499855351_18404643712105242_6632782493043547006_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjE0NDB4MTgwMC5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=scontent-ams2-1.cdninstagram.com&_nc_cat=106&_nc_oc=Q6cZ2QGHYnmuuzqxjVN_HhUEm9ssTnPycvgS5UfW9i0mvluIEcd0ATvkzxypyjVe-TydDAVASf7ZU0NZKYGUxEs_rH21&_nc_ohc=Ylx-tMGwIZAQ7kNvwFBVOj0&_nc_gid=s_UZe68B8TE8f2S1XSgUNQ&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzYzNzU1MzA3OTQ0MDk1MzQ0MQ%3D%3D.3-ccb7-5&oh=00_AfJDrob9uuSyPbe0_I5TvN_zidhEn2MOHXhUfMKRK5Ckkw&oe=68366BF1&_nc_sid=10d13b', NULL, '2025-05-23 16:54:56', '2025-05-23 16:54:56'),
(10, 6, 'с', 'https://sun9-43.userapi.com/s/v1/if2/u4uMweqYjkx6IVNZNJWBbkWnPxSZlGPUBYGw06LGlWxKSIT-7u0TWMN34lrqvAULXR00Ht5BFaoWr0fP0EgvrEaH.jpg?quality=95&as=32x18,48x27,72x40,108x61,160x90,240x135,360x202,480x270,540x304,640x360,720x405,1080x607,1280x720,1440x810,2048x1152&from=bu&u=tL9127wW2Q3dWPOTsUADbAG_rwesaJqq9J6bt-QjQmY&cs=2048x1152', NULL, '2025-05-23 16:56:36', '2025-05-23 16:56:36');

-- --------------------------------------------------------

--
-- Структура таблицы `post_likes`
--

CREATE TABLE `post_likes` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `post_likes`
--

INSERT INTO `post_likes` (`id`, `post_id`, `user_id`, `created_at`) VALUES
(1, 1, 6, '2025-05-23 00:25:43'),
(4, 2, 8, '2025-05-23 00:37:31'),
(5, 2, 6, '2025-05-23 10:19:16');

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `avatar`, `status`, `role`, `created_at`, `updated_at`) VALUES
(6, 'admin adminovм', 'admin@admin.ru', '$2y$10$z9T8crUv3lyr1mPgAhpy1Ob38uokjWbC68CMIsj4SdzWCAiRkkBRK', 'https://images.squarespace-cdn.com/content/v1/545d219be4b079130f42a75c/1445434337917-WUYU8OOJHFIIET57ZCMQ/image-asset.png?format=2500w', 'd', 'admin', '2025-05-22 23:34:06', '2025-05-23 10:21:50'),
(8, 'ssssssss sssssssss', 'admin@a.ru', '$2y$10$krKGwJ1MV3lD8h2OATYB.OacZ1upj7z6hQ.KIAZkC.OgGZRt6T9Pa', NULL, NULL, 'user', '2025-05-23 00:27:38', '2025-05-23 00:45:52');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Индексы таблицы `friendships`
--
ALTER TABLE `friendships`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`friend_id`),
  ADD KEY `friend_id` (`friend_id`);

--
-- Индексы таблицы `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `recipient_id` (`recipient_id`);

--
-- Индексы таблицы `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `original_post_id` (`original_post_id`);

--
-- Индексы таблицы `post_likes`
--
ALTER TABLE `post_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `post_id` (`post_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT для таблицы `friendships`
--
ALTER TABLE `friendships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT для таблицы `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT для таблицы `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT для таблицы `post_likes`
--
ALTER TABLE `post_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `friendships`
--
ALTER TABLE `friendships`
  ADD CONSTRAINT `friendships_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `friendships_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`original_post_id`) REFERENCES `posts` (`id`) ON DELETE SET NULL;

--
-- Ограничения внешнего ключа таблицы `post_likes`
--
ALTER TABLE `post_likes`
  ADD CONSTRAINT `post_likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
