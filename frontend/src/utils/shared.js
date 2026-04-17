import { jwtDecode } from "jwt-decode";
import { decodeJwt } from "jose";

export function decodeTokenServer(token) {
  try {
    return decodeJwt(token);
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
}

export function decodeTokenClient(token) {
  try {
    const payload = jwtDecode(token);
    return payload;
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
}

/**
 * Convert various truthy/falsy values to a proper boolean.
 *
 * @param {any} value - Input value (e.g., "true", "false", 1, 0, null)
 * @returns {boolean}
 *
 * @example
 * toBoolean("true")   // true
 * toBoolean("false")  // false
 * toBoolean(1)        // true
 * toBoolean(0)        // false
 */
export function toBoolean(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return Boolean(value);
}

/**
 * Check if a user has a specific permission.
 *
 * @param {string[]} permissions - List of user's permissions
 * @param {string} required - Required permission
 * @returns {boolean}
 *
 * @example
 * hasPermission(["app.view", "app.edit"], "app.edit") // true
 * hasPermission(["app.view"], "app.delete")           // false
 */
export function hasPermission(permissions, required) {
  return permissions?.includes(required);
}

/**
 * Check if a user has at least one of the required permissions.
 *
 * @param {string[]} permissions - List of user's permissions
 * @param {string[]} required - Array of required permissions
 * @returns {boolean}
 *
 * @example
 * hasAnyPermission(["app.view"], ["app.edit", "app.view"]) // true
 * hasAnyPermission(["app.view"], ["app.delete"])           // false
 */
export function hasAnyPermission(permissions, required) {
  return required.some((perm) => permissions?.includes(perm));
}

/**
 * Check if a user has all of the required permissions.
 *
 * @param {string[]} permissions - List of user's permissions
 * @param {string[]} required - Array of required permissions
 * @returns {boolean}
 *
 * @example
 * hasAllPermissions(["app.view", "app.edit"], ["app.view", "app.edit"]) // true
 * hasAllPermissions(["app.view"], ["app.edit"])                        // false
 */
export function hasAllPermissions(permissions, required) {
  return required.every((perm) => permissions?.includes(perm));
}

/**
 * Check if a user has a specific role.
 * @param {string} required - Required role
 * @returns {boolean}
 *
 * @example
 * hasRole(['admin', 'doctor'], 'doctor') // true
 */
export function hasRole(required) {
  const roles = ["admin", "doctor", "patient"];
  return roles.includes(required);
}

/**
 * Converts a plain object into FormData.
 * Supports nested objects, arrays, booleans, and File instances.
 *
 * @param {Object} obj - The input object to convert.
 * @param {FormData} [form] - Optional existing FormData to append to.
 * @param {string} [namespace] - Optional key prefix for nested objects.
 * @returns {FormData} - The resulting FormData instance.
 */
export function objectToFormData(obj, form = null, namespace = null) {
  const formData = form || new FormData();

  Object.entries(obj).forEach(([key, value]) => {
    const formKey = namespace ? `${namespace}[${key}]` : key;
    if (value === null || value === undefined) return;

    if (value instanceof File) {
      formData.append(formKey, value);
    } else if (Array.isArray(value)) {
      value.forEach((val, i) => {
        if (typeof val === "object" && !(val instanceof File)) {
          objectToFormData(val, formData, `${formKey}[${i}]`);
        } else {
          formData.append(`${formKey}[]`, val);
        }
      });
    } else if (typeof value === "object") {
      objectToFormData(value, formData, formKey);
    } else if (typeof value === "boolean") {
      formData.append(formKey, value ? "1" : "0");
    } else {
      formData.append(formKey, value);
    }
  });

  return formData;
}

/**
 * Retrieves the value of a specific cookie by name.
 * Parses document.cookie and returns the cookie value if found.
 *
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {string | undefined} - The cookie value or undefined if not found.
 */
export function getCookie(name) {
  if (typeof window === "undefined") return null;

  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1] ?? null
  );
}

/**
 * Sets a cookie with the specified name, value, and options.
 *
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value of the cookie.
 * @param {Object} [options] - Optional settings for the cookie (e.g., expires, path).
 */
export function setCookie(name, value) {
  document.cookie = `${name}=${value}; path=/; SameSite=Strict; Secure`;
}

/**
 * Removes a cookie by setting its expiration date to the past.
 *
 * @param {string} name - The name of the cookie to remove.
 * @param {string} [path='/'] - The path of the cookie to remove.
 */
export function removeCookie(name, path = "/") {
  document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Retrieves the current user's role from the `user` cookie.
 *
 * @returns {string|null} The user role if available; otherwise, null.
 */
export function getRole() {
  if (typeof window === "undefined") return null;

  const cookie = getCookie("user");
  if (!cookie) return null;
  try {
    const user = JSON.parse(cookie);
    return user?.role ?? null;
  } catch {
    return null;
  }
}

export const mapApiErrorsToFormik = (error) => {
  const apiErrors = error?.data?.errors;

  if (!apiErrors || !Array.isArray(apiErrors)) return {};

  const formattedErrors = {};

  apiErrors.forEach((err) => {
    if (err.field) {
      formattedErrors[err.field] = err.message;
    }
  });

  return formattedErrors;
};

/*
Example usage:

import { useFormik } from "formik";
import { mapApiErrorsToFormik } from "@/utils/mapApiErrorsToFormik";

const formik = useFormik({
  initialValues: {
    email: "",
    password: "",
  },
  onSubmit: async (values, { setErrors }) => {
    try {
      await apiCall(values);
    } catch (error) {
      const errors = mapApiErrorsToFormik(error);
      setErrors(errors);
    }
  },
});
*/
