// form-create相关的utils

import { isString, isPlainObject, isFunction, isArray } from "utils/isType";
import Vue from "vue";

// 注意默认值变量的执行顺序问题
export const baseOps = {
  form: {},
  submitBtn: {
    icon: "",
    innerText: "提交",
    col: {
      // 按钮居中
      span: 6,
      offset: 9,
    },
  },
  async mounted($f) {},
};

export const getFormFactory = ({
  getFields = () => [],
  baseOptions = baseOps,
}) => ({
  filters = [],
  processRule, // 对表单项field做遍历加工
  isRequired = false,
  options = baseOptions,
} = {}) => ({
  data = {},
  action = () => {},
  formMounted = async () => {},
} = {}) => {
  const getFilteredField = (fieldName, _data) => {
    const fields = getFields({ isRequired, data: _data });
    if (isString(fieldName)) {
      return isArray(fields)
        ? fields.find(({ field }) => field === fieldName)
        : { ...fields[fieldName], field: fieldName };
    }
    if (isPlainObject(fieldName)) {
      const { _fieldNames, props, ...rest } = fieldName;

      const dataIsEmptyArray =
        isArray(_data[fieldName.field]) && !_data[fieldName.field].length;
      // 如果数据源中的字段值是空数组，则使用表单项模板中的初始value
      const valueData = dataIsEmptyArray
        ? fieldName.value
        : _data[fieldName.field] || fieldName.value;

      return {
        ...rest,
        value: valueData,
        props: {
          ...props,
          rules:
            _fieldNames && _fieldNames.length
              ? _fieldNames
                  .map((n) => getFilteredField(n, valueData))
                  .filter(Boolean)
              : [],
        },
      };
    }
  };

  const filteredFields =
    filters && filters.length
      ? filters // 根据filters获取fields，并保证顺序与filters一致
          .map((fieldName) => getFilteredField(fieldName, data))
          .filter(Boolean)
      : [];

  const processed = isFunction(processRule)
    ? filteredFields
        .map((f) => {
          // 针对group中的rules
          const props = f.props || {};
          if (props.rules && props.rules.length) {
            props.rules = props.rules.map(processRule);
          }

          return processRule(f);
        })
        .filter(Boolean)
    : filteredFields;

  const {
    mounted = async () => {}, // 生成form函数时传入的mounted回调
    ...restOptions
  } = options;
  return {
    rule: processed,
    option: {
      injectEvent: true, // 注入form实例
      onSubmit: async (formData, $f) => {
        await routine({
          $f,
          asyncEvent: () => action($f, formData),
        });
      },
      async mounted($f) {
        await mounted($f);
        // 执行field单位级的_mounted
        const mounteds = $f
          .fields()
          .filter((name) => $f.model()[name]._mounted)
          .map(async (name) => await $f.model()[name]._mounted({ $f }));
        Promise.all(mounteds).then(async (it) => {
          await formMounted($f); //调用执行form函数时传入的mounted函数
        });
      },
      ...restOptions,
    },
  };
};

export const routine = async ({ $f, asyncEvent }) => {
  try {
    $f.submitBtnProps({ loading: true });
    await asyncEvent();
  } catch (error) {
    throw new Error(error.message || error.msg || "");
  } finally {
    $f.submitBtnProps({ loading: false });
  }
};

// 转为用于查看的表单json数据
export const convertToView = (formData, customHandleRule = () => {}) => {
  handleFormRule(formData.rule, customHandleRule);
  //option
  formData.option.submitBtn = false;
  formData.option.form = {
    ...formData.option.form,
    hideRequiredAsterisk: true,
  };
  return formData;
};

const handleFormRule = (rules, customHandleRule) => {
  (rules || []).forEach((ruleItem) => {
    ruleItem.validate = [];
    if (["input"].includes(ruleItem.type)) {
      ruleItem.type = "FCPlain";
      Vue.set(ruleItem, "props", {
        ...(ruleItem.props || {}),
        text: ruleItem.value,
      });
    }
    if (["rate", "select", "DatePicker"].includes(ruleItem.type)) {
      Vue.set(ruleItem, "props", {
        ...(ruleItem.props || {}),
        disabled: true,
      });
    }
    if (ruleItem.control && ruleItem.control.length) {
      ruleItem.control.map((cs) => handleFormRule(cs.rule));
    }
    if (["group"].includes(ruleItem.type)) {
      handleFormRule(ruleItem.props.rules);
      Vue.set(ruleItem, "props", {
        ...ruleItem.props,
        min: 0,
        max: 0,
        button: false,
        disabled: true,
      });
    }
    if (["upload"].includes(ruleItem.type)) {
      if (!ruleItem.value) ruleItem.type = "FCPlain";
      ruleItem.props.allowRemove = false;
    }
    isFunction(customHandleRule) && customHandleRule(ruleItem);
  });
};

export const setRequired = (names = [], $f, flag = true) => {
  names.forEach((nm) => {
    let name = nm,
      subNames = [];
    if (isPlainObject(nm)) {
      name = nm.name;
      subNames = nm.subNames;
    }
    if ($f.model()[name]) {
      if ($f.model()[name].type === "group") {
        const ps = $f.model()[name].props;
        if (ps) {
          flag ? (ps.min = 1) : (ps.min = 0);
          const subForm = $f.getSubForm(name) || [];
          // 根据subNames设置已实例子表单项组的validate required
          subForm.forEach(($subF) => {
            setRequired(subNames, $subF, flag);
          });
          // 根据subNames修改+的子表单项组模板的validate required
          (ps.rules || [])
            .filter((fi) => subNames.includes(fi.field))
            .forEach((fi) => applyRequiredValue(fi, flag));
        }
      }

      applyRequiredValue($f.model()[name], flag);
    }
  });
};

const applyRequiredValue = (fieldItem, flag) => {
  fieldItem.validate = fieldItem.validate || []; // 注意字段未初始的UI响应问题
  const matchedIdx = (fieldItem.validate || []).findIndex(
    (item) => item.required
  );
  if (flag) {
    matchedIdx == -1 &&
      fieldItem.validate.push({ required: true, message: "必填" });
  } else {
    matchedIdx !== -1 && fieldItem.validate.splice(matchedIdx, 1);
  }
};

export const validator = {
  price: () => {
    return (rule, val, callback) => {
      const value = val.toString();
      const v = [
        value.split(".").length > 2,
        (value.split(".")[1] || []).length > 2,
        value.split(".").length === 2 && value.split(".")[1].length === 0,
        isNaN(value),
      ];
      if (v.some(Boolean)) {
        callback(new Error("格式错误"));
      } else {
        callback();
      }
    };
  },
};
