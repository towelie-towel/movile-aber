export const isValidPhone = (
  phoneNumber: string,
  errors = {
    length: {
      active: true,
      message: '¿Por qué su numero no tiene <value> cifras? 🤨',
      value: 8,
    },
    starts_with: {
      active: true,
      message: 'Su número debe comenzar con 5 😐',
      value: '5',
    },
    invalid_chars: {
      active: true,
      message: 'Todos los caractéres deben ser números 🤌, sobra el: <value>',
      with_invalid: true,
    },
  }
): [boolean, string] => {
  if (phoneNumber.length !== errors.length.value && errors.length.active) {
    return [false, errors.length.message.replace('<value>', errors.length.value.toString())];
  }

  if (!phoneNumber.startsWith(errors.starts_with.value) && errors.starts_with.active) {
    return [
      false,
      errors.starts_with.message.replace('<value>', errors.starts_with.value.toString()),
    ];
  }

  if (errors.starts_with.active) {
    for (let i = 0; i < phoneNumber.length; i++) {
      if (isNaN(Number(phoneNumber.charAt(i)))) {
        if (errors.invalid_chars.with_invalid) {
          return [false, errors.invalid_chars.message.replace('<value>', phoneNumber.charAt(i))];
        } else {
          return [false, errors.invalid_chars.message];
        }
      }
    }
  }

  return [true, ''];
};

export const isValidPassword = (
  password: string,
  errors = {
    min_length: {
      active: true,
      message: 'Su contraseña debe tener más de <value> caracteres 😐',
      value: 8,
    },
    max_length: {
      active: true,
      message: 'Su contraseña no debe exeder los <value> caracteres 😐',
      value: 20,
    },
  }
): [boolean, string] => {
  if (password.length > errors.max_length.value && errors.max_length.active) {
    return [
      false,
      errors.max_length.message.replace('<value>', errors.max_length.value.toString()),
    ];
  }

  if (password.length < errors.min_length.value && errors.min_length.active) {
    return [
      false,
      errors.min_length.message.replace('<value>', errors.min_length.value.toString()),
    ];
  }

  return [true, ''];
};

export const isValidUsername = (
  username: string,
  errors = {
    max_length: {
      active: true,
      message: 'Su nombre de usuario no debe tener más de <value> caracteres 😐',
      value: 8,
    },
    min_length: {
      active: true,
      message: 'Su nombre de usuario no debe exeder los <value> caracteres 😐',
      value: 20,
    },
    only_alphanumerics: {
      active: true,
      message: 'Su nombre de usuario solo puede contener caracteres alfanuméricos 😐',
    },
  }
): [boolean, string] => {
  if (username.length > errors.max_length.value && errors.max_length.active) {
    return [
      false,
      errors.max_length.message.replace('<value>', errors.max_length.value.toString()),
    ];
  }
  if (username.length < errors.min_length.value && errors.min_length.active) {
    return [
      false,
      errors.min_length.message.replace('<value>', errors.min_length.value.toString()),
    ];
  }
  if (!/^[a-zA-Z0-9]+$/.test(username) && errors.only_alphanumerics.active) {
    return [false, errors.only_alphanumerics.message];
  }

  return [true, ''];
};
