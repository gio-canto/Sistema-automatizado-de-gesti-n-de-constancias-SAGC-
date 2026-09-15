import { sileo } from 'sileo';

export const notify = {
  success(title, description) {
    return sileo.success({ title, description });
  },
  error(title, description) {
    return sileo.error({ title, description });
  },
  warning(title, description) {
    return sileo.warning({ title, description });
  },
  info(title, description) {
    return sileo.info({ title, description });
  },
  loading(title, description) {
    return sileo.loading({ title, description });
  },
  promise(promise, options) {
    return sileo.promise(promise, options);
  },
  dismiss(id) {
    return sileo.dismiss(id);
  },
  clear() {
    return sileo.clear();
  },
};
