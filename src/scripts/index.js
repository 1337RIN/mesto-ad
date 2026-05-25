/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import "../pages/index.css";

import {
  getUserInfo,
  getCards,
  updateUserInfo,
  updateAvatar,
  addCard,
  changeLikeStatus,
  removeCardRequest
} from "./components/api.js";
import {
  createCardElement,
  removeCard,
  toggleCardLike
} from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import {
  startValidation,
  clearValidation
} from "./components/validation.js";

const formValidationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible"
};
startValidation(formValidationSettings);

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");
const cardInfoPopup = document.querySelector(".popup_type_info");
const cardInfoList = cardInfoPopup.querySelector(".popup__info");
const cardInfoText = cardInfoPopup.querySelector(".popup__text");
const cardInfoUsers = cardInfoPopup.querySelector(".popup__list");
const infoTemplate = document.getElementById("popup-info-definition-template");
const userBadgeTemplate = document.getElementById("popup-info-user-preview-template");

let currentUserId = null;
let currentCardId = null;
let currentCardElement = null;

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = async (evt) => {
  evt.preventDefault();
  const submitButton = profileForm.querySelector(".popup__button");
  const defaultButtonText = submitButton.textContent;
  toggleLoadingState(
    submitButton,
    true,
    defaultButtonText,
    "Сохранение..."
  );
  try {
    const updatedUser = await updateUserInfo({
        name: profileTitleInput.value,
        about: profileDescriptionInput.value 
      });
    profileTitle.textContent = updatedUser.name;
    profileDescription.textContent = updatedUser.about;
    closeModalWindow(profileFormModalWindow);
  } catch (error) {
    console.error(
      "Ошибка обновления профиля:",
      error
    );
  } finally {
    toggleLoadingState(
      submitButton,
      false,
      defaultButtonText,
      "Сохранение..."
    );
  }
};

const handleAvatarFormSubmit = async (evt) => {
  evt.preventDefault();
  const submitButton = avatarForm.querySelector(".popup__button");
  const defaultButtonText = submitButton.textContent;
  toggleLoadingState(
    submitButton,
    true,
    defaultButtonText,
    "Сохранение..."
  );
  try {
    const updatedUser = await updateAvatar(avatarInput.value);
    profileAvatar.style.backgroundImage = `url(${updatedUser.avatar})`;
    closeModalWindow(avatarFormModalWindow);
    avatarForm.reset();
    clearValidation(
      avatarForm,
      formValidationSettings
    );
  } catch (error) {
    console.error(
      "Ошибка обновления аватара:",
      error
    );
  } finally {
    toggleLoadingState(
      submitButton,
      false,
      defaultButtonText,
      "Сохранение..."
    );
  }
};

const handleCardFormSubmit = async (evt) => {
  evt.preventDefault();
  const submitButton = cardForm.querySelector(".popup__button");
  const defaultButtonText = submitButton.textContent;
  toggleLoadingState(
    submitButton,
    true,
    defaultButtonText,
    "Создание..."
  );
  try {
    const newCard = await addCard({
      name: cardNameInput.value,
      link: cardLinkInput.value
    });
    const createdCard =
      createCardElement(newCard, {
        onPreviewPicture:
          handlePreviewPicture,
        onLikeClick: (cardId, likeButton, likesCounter, isLiked) =>
          toggleCardLike(cardId, likeButton, likesCounter, isLiked, changeLikeStatus),
        onDeleteClick: (cardId, cardElement) => {
          openRemoveCardModal(cardId, cardElement);
        },
        onInfoOpen:
          handleInfoOpen,
        currentUserId
      });
    placesWrap.prepend(createdCard);
    closeModalWindow(cardFormModalWindow);
    cardForm.reset();
    clearValidation(
      cardForm,
      formValidationSettings
    );
  } catch (error) {
    console.error(
      "Ошибка создания карточки:",
      error
    );
  } finally {
    toggleLoadingState(
      submitButton,
      false,
      defaultButtonText,
      "Создание..."
    );
  }
};

const handleRemoveCardSubmit = async (evt) => {
  evt.preventDefault();
  const submitButton = removeCardForm.querySelector(".popup__button");
  const defaultButtonText = submitButton.textContent;
  toggleLoadingState(
    submitButton,
    true,
    defaultButtonText,
    "Удаление..."
  );
  try {
    await removeCard(
      currentCardId,
      currentCardElement,
      removeCardRequest
    );
    closeModalWindow(removeCardModalWindow);
    currentCardId = null;
    currentCardElement = null;
  } catch (error) {
    console.error(
      "Ошибка удаления карточки:",
      error
    );
  } finally {
    toggleLoadingState(
      submitButton,
      false,
      defaultButtonText,
      "Удаление..."
    );
  }
};

const formatDate = (dateString) => {
  const currentDate = new Date(dateString);
  return currentDate.toLocaleDateString(
    "ru-RU",
    {
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );
};

const createInfoElement = (title, description) => {
  const infoElement =
    infoTemplate.content.cloneNode(true);
  
  infoElement.querySelector(".popup__info-term").textContent = title;

  infoElement.querySelector(".popup__info-description").textContent = description;

  return infoElement;
};

const createUserBadge = (userName) => {
  const badgeElement = userBadgeTemplate.content.cloneNode(true);
  badgeElement.querySelector(".popup__list-item").textContent = userName;
  return badgeElement;
};

const toggleLoadingState = (buttonElement, isLoading, defaultText, loadingText) => {
  if (isLoading) {
    buttonElement.textContent = loadingText;
    buttonElement.disabled = true;

    return;
  }

  buttonElement.textContent = defaultText;
  buttonElement.disabled = false;
};

const openRemoveCardModal = (cardId, cardElement) => {
  currentCardId = cardId;
  currentCardElement = cardElement;
  clearValidation(
    removeCardForm,
    formValidationSettings
  );

  openModalWindow(removeCardModalWindow);
};

const handleInfoOpen = async (cardId) => {
  try {
    const cards = await getCards();
    const currentCard = cards.find((card) => {return card._id === cardId;});

    if (!currentCard) {
      return;
    }

    cardInfoList.innerHTML = "";
    cardInfoUsers.innerHTML = "";

    cardInfoList.append(
      createInfoElement(
        "Описание:",
        currentCard.name
      )
    );

    cardInfoList.append(
      createInfoElement(
        "Дата создания:",
        formatDate(
          currentCard.createdAt
        )
      )
    );

    cardInfoList.append(
      createInfoElement(
        "Владелец:",
        currentCard.owner.name
      )
    );

    cardInfoList.append(
      createInfoElement(
        "Количество лайков:",
        currentCard.likes.length.toString()
      )
    );

    cardInfoText.textContent =
      "Лайкнули:";

    if (
      currentCard.likes.length === 0
    ) {
      cardInfoUsers.append(
        createUserBadge("Нет лайков")
      );
    } else {
      currentCard.likes.forEach((userData) => {cardInfoUsers.append(createUserBadge(userData.name));});
    }

    openModalWindow(cardInfoPopup);
  } catch (error) {
    console.error(
      "Ошибка открытия информации:",
      error
    );
  }
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardSubmit);

openProfileFormButton.addEventListener("click", () => {
    profileTitleInput.value = profileTitle.textContent;
    profileDescriptionInput.value = profileDescription.textContent;
    clearValidation(
      profileForm,
      formValidationSettings
    );
    openModalWindow(profileFormModalWindow);
  }
);

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(
    avatarForm,
    formValidationSettings
  );
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(
    cardForm,
    formValidationSettings
  );
  openModalWindow(cardFormModalWindow);
});

Promise.all([
  getCards(),
  getUserInfo()
])
  .then(([cards, userData]) => {
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;

    profileAvatar.style.backgroundImage =
      `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(cardData, {
          onPreviewPicture: handlePreviewPicture,
          onLikeClick: (cardId, likeButton, likesCounter, isLiked) =>
            toggleCardLike(cardId, likeButton, likesCounter, isLiked, changeLikeStatus),
          onDeleteClick: (cardId, cardElement) => {
            openRemoveCardModal(cardId, cardElement);
          },
          onInfoOpen: handleInfoOpen,
          currentUserId
        })
      );
    });
  })
  .catch((error) => {
    console.error(
      "Ошибка загрузки данных:",
      error
    );
  });

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});
 