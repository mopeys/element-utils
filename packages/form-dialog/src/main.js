import Vue from "vue";
import formDialog from "./index";
import shallowMerge from "element-ui/src/utils/merge";

const propKeys = ["dialogProps", "component", "formData"];
const defaultProps = {
  dialogProps: {
    width: "400px",
    "close-on-click-modal": false,
  },
  component: null,
  formData: null,
};

let instance;

const FormDialogConstructor = Vue.extend(formDialog);

const initInstance = () => {
  instance = new FormDialogConstructor({
    el: document.createElement("div"),
  });
};
const open = (options = {}) => {
  if (!instance) {
    initInstance();
    document.body.appendChild(instance.$el);
  }

  if (instance.dialogProps.visible) {
    initProps();
  }

  Vue.nextTick(() => {
    propKeys.map((key) => {
      instance[key] = shallowMerge({}, defaultProps[key], options[key]);
    });
    instance.$set(instance.dialogProps, "visible", true);
  });
};

const initProps = () => {
  propKeys.map((key) => {
    instance[key] = shallowMerge({}, defaultProps[key]);
  });
};

const FormDialog = {
  open,
  close: function () {
    instance.closeDialog();
  },
};

export default FormDialog;
