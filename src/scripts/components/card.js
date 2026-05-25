export const toggleCardLike = async (cardId, likeButton, likesCounter, isLiked, updateLikeStatus) => {
  try {
    const updatedCard = await updateLikeStatus(cardId, isLiked);

    likeButton.classList.toggle(
      "card__like-button_is-active"
    );

    likesCounter.textContent = updatedCard.likes.length;

    return updatedCard;
  } catch (error) {
    console.error("Ошибка лайка карточки:", error);
  }
};

export const removeCard = async (cardId, cardElement, removeCardFromServer) => {
  try {
    await removeCardFromServer(cardId);

    cardElement.remove();
  } catch (error) {
    console.error("Ошибка удаления карточки:", error);
  }
};

const getTemplate = () => {
  return document
    .querySelector("#card-template")
    .content
    .querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (cardData,
  {
    onPreviewPicture,
    onLikeClick,
    onDeleteClick,
    onInfoOpen,
    currentUserId
  }
) => {
  const cardElement = getTemplate();
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  const likesCounter = cardElement.querySelector(".card__like-count");
  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likesCounter.textContent = cardData.likes.length;
  const cardIsLiked = cardData.likes.some((user) => {
    return user._id === currentUserId;
  });
  if (cardIsLiked) {
    likeButton.classList.add(
      "card__like-button_is-active"
    );
  }
  const isCardOwner = cardData.owner._id === currentUserId;
  if (!isCardOwner) {
    deleteButton.remove();
  }
  if (onLikeClick) {
    likeButton.addEventListener("click", () => {
      const currentLikeState = likeButton.classList.contains(
        "card__like-button_is-active"
      );

      onLikeClick(
        cardData._id,
        likeButton,
        likesCounter,
        currentLikeState
      );
    });
  }
  if (onDeleteClick && isCardOwner) {
    deleteButton.addEventListener("click", () => {
      onDeleteClick(cardData._id, cardElement);
    });
  }
  if (onInfoOpen) {
    infoButton.addEventListener("click", () => {
      onInfoOpen(cardData._id);
    });
  }
  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => {
      onPreviewPicture({
        name: cardData.name,
        link: cardData.link
      });
    });
  }

  return cardElement;
};