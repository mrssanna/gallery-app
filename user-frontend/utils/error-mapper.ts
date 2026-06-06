export const translateError = (errorKey: string | string[] | any): string => {
  if (!errorKey) return "Произошла неизвестная ошибка.";

  if (Array.isArray(errorKey)) {
    // Если пришел массив ошибок (например, от class-validator), переводим первую
    return translateError(errorKey[0]);
  }

  // Если пришел объект (например, { message: '...' }), пытаемся достать строку
  if (typeof errorKey === "object") {
    return translateError(
      errorKey.message || errorKey.error || JSON.stringify(errorKey),
    );
  }

  const errorMap: Record<string, string> = {
    USER_ALREADY_EXISTS: "Пользователь с таким email уже существует.",
    USER_NOT_FOUND: "Пользователь не найден.",
    INVALID_LOGIN_OR_PASSWORD: "Неверный email или пароль.",
    UNAUTHORIZED: "Вы не авторизованы. Пожалуйста, войдите в систему.",
    ACCESS_DENIED: "Доступ запрещен.",
    USER_IS_NOT_EXIST: "Пользователь не существует.",
    PASSWORD_IS_NOT_VALID_FORMAT:
      "Пароль должен содержать минимум 1 заглавную букву, 1 строчную, 1 цифру и 1 спецсимвол.",
    PASSWORD_INVALID_LENGTH: "Длина пароля должна быть от 8 до 12 символов.",
    LOGIN_IS_NOT_VALID_FORMAT: "Введите корректный email адрес.",
    FILE_SIZE_LIMIT: "Размер файла превышает допустимый лимит (1 МБ).",
    FILE_UPLOAD_ERROR: "Ошибка при загрузке файла. Попробуйте позже.",
    FILE_REMOVE_ERROR: "Ошибка при удалении файла.",
    FILE_NOT_FOUND: "Файл не найден.",
    "Bad Request": "Неверный запрос.",
    "Internal server error": "Внутренняя ошибка сервера.",
    "Token expired": "Время сессии истекло. Пожалуйста, войдите снова.",
    "Invalid token": "Недействительный токен авторизации.",
    "Ваш аккаунт заблокирован. Вы не можете публиковать картинки.":
      "Ваш аккаунт заблокирован. Вы не можете публиковать картинки.",
  };

  // Если ошибка есть в словаре, возвращаем перевод. Иначе возвращаем оригинальный текст.
  return errorMap[errorKey] || errorKey;
};
