/**
 * @fileoverview define the import file order for 'define' function
 * @author zhu.caixia
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "define the import file order for 'define' function",
            category: "Fill me in",
            recommended: false
        },
        fixable: null,  // or "code" or "whitespace"
        schema: [
            // fill in your schema
        ]
    },

    create: function(context) {

        // variables should be defined here

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        // any helper functions should go here or else delete this section

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        // 引入文件路径优先级定义
        const HtmlPathLevel = 1;
        const I18nPathLevel = 2;
        const ModelPathLevel = 3;
        const ActionPathLevel = 4;
        const JsPathLevel = 5;
        const CssPathLevel = 6;
        // 引入文件路径模式匹配
        const HtmlPathExpr = /^((text|hbs)\!)\S+(\.html)$/;
        const I18nPathExpr = /^(i18n!)\S+/;
        const ModelPathExpr = /\S+(\/models\/)\S+/;
        const ActionPathExpr = /\S+(\/actions\/)\S+/;
        const CssPathExpr = /^(css!)\S+(\.css)$/;

        /**
         * 获取引用路径类型所规范的顺序
         * @author zhu.caixia
         * @date   2017-03-21
         * @param  {String}   path 路径
         * @return {Number}        顺序优先级
         */
        function getPathType(path) {

            if (HtmlPathExpr.test(path)) {
                return HtmlPathLevel;
            } else if (I18nPathExpr.test(path)) {
                return I18nPathLevel;
            } else if (ModelPathExpr.test(path)) {
                return ModelPathLevel;
            } else if (ActionPathExpr.test(path)) {
                return ActionPathLevel;
            } else if (CssPathExpr.test(path)) {
                return CssPathLevel;
            }

            return JsPathLevel;
        }

        /**
         * 根据引用路径类型的优先级，判断回调函数中的形参变量是否符合大小驼峰式命名规范
         * 对于引用的js文件未做变量判断
         * @author zhu.caixia
         * @date   2017-03-21
         * @param  {String}   varDefine 形参变量定义
         * @param  {Number}   level     顺序优先级
         * @return {Boolean}            是否符合变量命名规范
         */
        function isMatchVarDefine(varDefine, level) {
            let matchDefineExpr;

            switch (level) {
                case HtmlPathLevel:
                case I18nPathLevel:
                case ActionPathLevel:
                case CssPathLevel:
                    matchDefineExpr = /^[a-z](\w|\d)+/;
                    break;
                case ModelPathLevel:
                    matchDefineExpr = /^[A-Z](\w|\d)+/;
                    break;
                default:
                    matchDefineExpr = false;
            }

            if (matchDefineExpr) {
                return matchDefineExpr.test(varDefine);
            }

            return true;
        }

        return {
            CallExpression: function(node) {

                if (node.callee.name === 'define') {

                    if (node.arguments[0].type === 'ArrayExpression' && node.arguments[1].type === 'FunctionExpression') {
                        // 定义引入路径和回调函数的形参变量定义
                        const inputPaths = node.arguments[0].elements;
                        const inputArguments = node.arguments[1].params;
                        let prevLevel = HtmlPathLevel;
                        let inputArgsLength = inputArguments.length;

                        for (let i=0; i<inputPaths.length; i++) {
                            let path = inputPaths[i].value;
                            let curLevel = getPathType(path);
                            // 判断引入文件路径的顺序是否满足规范
                            if (curLevel < prevLevel) {
                                context.report({
                                    node,
                                    message: 'Wrong import file order "{{filePath}}"  in \'define()\' function',
                                    data: {filePath: path}
                                });
                            }

                            // 判断回调函数中的形参定义是否满足大小驼峰式命名规范
                            if (i < inputArgsLength) {
                                let inputArgs = inputArguments[i].name;

                                if (!isMatchVarDefine(inputArgs, curLevel)) {
                                    context.report({
                                        node,
                                        message: 'The variable "{{varName}}" definition in \'define()\' function does not match camelcase naming rules',
                                        data: {varName: inputArgs}
                                    });
                                }
                            }

                            prevLevel = curLevel;
                        }
                    }
                }

            }
        };
    }
};
