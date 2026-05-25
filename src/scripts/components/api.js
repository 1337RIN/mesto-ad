const apiSettings = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-203",
  headers: {
    authorization: "54677a58-6865-4477-a467-32bd96b8cdbe",
    "Content-Type": "application/json",
  },
};
/* Проверяем, успешно ли выполнен запрос, и отклоняем промис в случае ошибки. */
const getResponseData = (res) => {
  return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
};

export const getUserInfo = () => {
  return fetch(`${apiSettings.baseUrl}/users/me`, { // Запрос к API-серверу
    headers: apiSettings.headers, // Подставляем заголовки
  }).then(getResponseData);  // Проверяем успешность выполнения запроса
};

export const getCards = () => {
  return fetch(`${apiSettings.baseUrl}/cards`, {
    headers: apiSettings.headers,
  }).then(getResponseData);
};

export const updateUserInfo = ({ name, about }) => {
  return fetch(`${apiSettings.baseUrl}/users/me`, {
    method: "PATCH",
    headers: apiSettings.headers,
    body: JSON.stringify({ name, about }),
  }).then(getResponseData);
};

export const updateAvatar = (avatar) => {
  return fetch(`${apiSettings.baseUrl}/users/me/avatar`, {
    method: "PATCH",
    headers: apiSettings.headers,
    body: JSON.stringify({ avatar }),
  }).then(getResponseData);
};

export const addCard = ({ name, link }) => {
  return fetch(`${apiSettings.baseUrl}/cards`, {
    method: "POST",
    headers: apiSettings.headers,
    body: JSON.stringify({ name, link }),
  }).then(getResponseData);
};

export const removeCardRequest = (cardId) => {
  return fetch(`${apiSettings.baseUrl}/cards/${cardId}`, {
    method: "DELETE",
    headers: apiSettings.headers,
  }).then(getResponseData);
};

export const changeLikeStatus = (cardId, isLiked) => {
  return fetch(`${apiSettings.baseUrl}/cards/likes/${cardId}`, {
    method: isLiked ? "DELETE" : "PUT",
    headers: apiSettings.headers,
  }).then(getResponseData);
};