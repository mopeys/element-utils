import FormDialog from "packages/form-dialog";
import FormCreate from "packages/form-create";

const components = [FormCreate];

const install = function (Vue) {
  if (install.installed) return;
  components.map((component) => component.install(Vue));

  Vue.prototype.$formDialog = FormDialog;
  install.installed = true;
};

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  install,
  FormDialog,
  FormCreate,
};
