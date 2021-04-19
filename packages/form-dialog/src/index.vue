<template>
  <el-dialog
    :custom-class="`form-dialog ${dialogProps.customClass || ''}`"
    v-bind="dialogProps"
    @close="closeDialog"
    :visible="dialogProps.visible"
  >
    <component v-if="hasComponent" v-bind:is="component"></component>
    <form-create
      v-if="hasFormData"
      v-model="formDialogForm"
      :rule="formData.rule"
      :option="options"
    />
  </el-dialog>
</template>

<script>
import { isString } from "utils/isType";
export default {
  name: "FormDialog",
  data() {
    return {
      formDialogForm: {},
      dialogProps: {},
      component: null,
      formData: null,
    };
  },
  mounted() {},
  methods: {
    closeDialog() {
      this.$set(this.dialogProps, "visible", false);
    },
  },
  computed: {
    options() {
      return {
        global: {},
        ...this.formData.option,
      };
    },
    hasFormData() {
      return this.formData && this.formData.rule;
    },
    hasComponent() {
      return (
        isString(this.component) ||
        (this.component &&
          ["data", "template", "render"].some((key) => this.component[key]))
      );
    },
  },
};
</script>

<style lang="scss">
.form-dialog {
  .el-select,
  .el-autocomplete {
    width: 100%; // select强制撑满
  }
}
</style>
