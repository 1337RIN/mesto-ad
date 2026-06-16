const checkInvalidInputs = (inputList) => {
  return inputList.some((inputField) => {
    return !inputField.validity.valid;
  });
};

const disableSubmitButton = (submitButton, settings) => {
  submitButton.disabled = true;
  submitButton.classList.add(settings.inactiveButtonClass);
};

const enableSubmitButton = (submitButton, settings) => {
  submitButton.disabled = false;
  submitButton.classList.remove(settings.inactiveButtonClass);
};

const displayInputError = (
  formElement,
  inputElement,
  errorMessage,
  settings
) => {
  const errorElement = formElement.querySelector(
    `#${inputElement.id}-error`
  );

  if (!errorElement) {
    return;
  }

  inputElement.classList.add(settings.inputErrorClass);
  errorElement.classList.add(settings.errorClass);
  errorElement.textContent = errorMessage;
};

const clearInputError = (formElement, inputElement, settings) => {
  const errorElement = formElement.querySelector(
    `#${inputElement.id}-error`
  );

  if (!errorElement) {
    return;
  }

  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.classList.remove(settings.errorClass);
  errorElement.textContent = '';
};

const getCustomErrorMessage = (inputElement) => {
  return inputElement.dataset.errorMessage || '';
};

const checkInputValidity = (formElement, inputElement, settings) => {
  if (!inputElement.validity.valid) {
    let errorMessage = inputElement.validationMessage;

    const customError = getCustomErrorMessage(inputElement);

    if (
      customError &&
      (
        inputElement.validity.patternMismatch ||
      )
    ) {
      errorMessage = customError;
    }

    displayInputError(
      formElement,
      inputElement,
      errorMessage,
      settings
    );

    return;
  }

  clearInputError(formElement, inputElement, settings);
};

const updateButtonState = (
  inputList,
  submitButton,
  settings
) => {
  const formIsInvalid = checkInvalidInputs(inputList);

  if (formIsInvalid) {
    disableSubmitButton(submitButton, settings);
  } else {
    enableSubmitButton(submitButton, settings);
  }
};

const setEventListeners = (formElement, settings) => {
  const inputList = Array.from(
    formElement.querySelectorAll(settings.inputSelector)
  );

  const submitButton = formElement.querySelector(
    settings.submitButtonSelector
  );

  updateButtonState(inputList, submitButton, settings);

  inputList.forEach((inputField) => {
    inputField.addEventListener('input', () => {
      checkInputValidity(
        formElement,
        inputField,
        settings
      );

      updateButtonState(
        inputList,
        submitButton,
        settings
      );
    });
  });
};

export const clearValidation = (
  formElement,
  settings
) => {
  const inputList = Array.from(
    formElement.querySelectorAll(settings.inputSelector)
  );

  const submitButton = formElement.querySelector(
    settings.submitButtonSelector
  );

  inputList.forEach((inputField) => {
    clearInputError(
      formElement,
      inputField,
      settings
    );
  });

  disableSubmitButton(submitButton, settings);
};

export const startValidation = (settings) => {
  const forms = Array.from(
    document.querySelectorAll(settings.formSelector)
  );

  forms.forEach((currentForm) => {
    setEventListeners(currentForm, settings);
  });
};
