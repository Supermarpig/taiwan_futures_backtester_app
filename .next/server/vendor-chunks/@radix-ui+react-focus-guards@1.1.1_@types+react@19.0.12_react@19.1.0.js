"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@radix-ui+react-focus-guards@1.1.1_@types+react@19.0.12_react@19.1.0";
exports.ids = ["vendor-chunks/@radix-ui+react-focus-guards@1.1.1_@types+react@19.0.12_react@19.1.0"];
exports.modules = {

/***/ "(ssr)/./node_modules/.pnpm/@radix-ui+react-focus-guards@1.1.1_@types+react@19.0.12_react@19.1.0/node_modules/@radix-ui/react-focus-guards/dist/index.mjs":
/*!**********************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@radix-ui+react-focus-guards@1.1.1_@types+react@19.0.12_react@19.1.0/node_modules/@radix-ui/react-focus-guards/dist/index.mjs ***!
  \**********************************************************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   FocusGuards: () => (/* binding */ FocusGuards),\n/* harmony export */   Root: () => (/* binding */ Root),\n/* harmony export */   useFocusGuards: () => (/* binding */ useFocusGuards)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"(ssr)/./node_modules/.pnpm/next@15.1.4_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js\");\n/* __next_internal_client_entry_do_not_use__ FocusGuards,Root,useFocusGuards auto */ // packages/react/focus-guards/src/FocusGuards.tsx\n\nvar count = 0;\nfunction FocusGuards(props) {\n    useFocusGuards();\n    return props.children;\n}\nfunction useFocusGuards() {\n    react__WEBPACK_IMPORTED_MODULE_0__.useEffect({\n        \"useFocusGuards.useEffect\": ()=>{\n            const edgeGuards = document.querySelectorAll(\"[data-radix-focus-guard]\");\n            document.body.insertAdjacentElement(\"afterbegin\", edgeGuards[0] ?? createFocusGuard());\n            document.body.insertAdjacentElement(\"beforeend\", edgeGuards[1] ?? createFocusGuard());\n            count++;\n            return ({\n                \"useFocusGuards.useEffect\": ()=>{\n                    if (count === 1) {\n                        document.querySelectorAll(\"[data-radix-focus-guard]\").forEach({\n                            \"useFocusGuards.useEffect\": (node)=>node.remove()\n                        }[\"useFocusGuards.useEffect\"]);\n                    }\n                    count--;\n                }\n            })[\"useFocusGuards.useEffect\"];\n        }\n    }[\"useFocusGuards.useEffect\"], []);\n}\nfunction createFocusGuard() {\n    const element = document.createElement(\"span\");\n    element.setAttribute(\"data-radix-focus-guard\", \"\");\n    element.tabIndex = 0;\n    element.style.outline = \"none\";\n    element.style.opacity = \"0\";\n    element.style.position = \"fixed\";\n    element.style.pointerEvents = \"none\";\n    return element;\n}\nvar Root = FocusGuards;\n //# sourceMappingURL=index.mjs.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vQHJhZGl4LXVpK3JlYWN0LWZvY3VzLWd1YXJkc0AxLjEuMV9AdHlwZXMrcmVhY3RAMTkuMC4xMl9yZWFjdEAxOS4xLjAvbm9kZV9tb2R1bGVzL0ByYWRpeC11aS9yZWFjdC1mb2N1cy1ndWFyZHMvZGlzdC9pbmRleC5tanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBdUI7QUFHdkIsSUFBSSxRQUFRO0FBRVosU0FBUyxZQUFZLE9BQVk7SUFDL0IsZUFBZTtJQUNmLE9BQU8sTUFBTTtBQUNmO0FBTUEsU0FBUyxpQkFBaUI7SUFDbEI7b0NBQVU7WUFDZCxNQUFNLGFBQWEsU0FBUyxpQkFBaUIsMEJBQTBCO1lBQ3ZFLFNBQVMsS0FBSyxzQkFBc0IsY0FBYyxXQUFXLENBQUMsS0FBSyxpQkFBaUIsQ0FBQztZQUNyRixTQUFTLEtBQUssc0JBQXNCLGFBQWEsV0FBVyxDQUFDLEtBQUssaUJBQWlCLENBQUM7WUFDcEY7WUFFQTs0Q0FBTztvQkFDTCxJQUFJLFVBQVUsR0FBRzt3QkFDZixTQUFTLGlCQUFpQiwwQkFBMEIsRUFBRTt3REFBUSxDQUFDLE9BQVMsS0FBSyxPQUFPLENBQUM7O29CQUN2RjtvQkFDQTtnQkFDRjs7UUFDRjttQ0FBRyxDQUFDLENBQUM7QUFDUDtBQUVBLFNBQVMsbUJBQW1CO0lBQzFCLE1BQU0sVUFBVSxTQUFTLGNBQWMsTUFBTTtJQUM3QyxRQUFRLGFBQWEsMEJBQTBCLEVBQUU7SUFDakQsUUFBUSxXQUFXO0lBQ25CLFFBQVEsTUFBTSxVQUFVO0lBQ3hCLFFBQVEsTUFBTSxVQUFVO0lBQ3hCLFFBQVEsTUFBTSxXQUFXO0lBQ3pCLFFBQVEsTUFBTSxnQkFBZ0I7SUFDOUIsT0FBTztBQUNUO0FBRUEsSUFBTSxPQUFPIiwic291cmNlcyI6WyIvVXNlcnMvY29keS9Db2Rl5bCI5Y2AL3NyYy9Gb2N1c0d1YXJkcy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG4vKiogTnVtYmVyIG9mIGNvbXBvbmVudHMgd2hpY2ggaGF2ZSByZXF1ZXN0ZWQgaW50ZXJlc3QgdG8gaGF2ZSBmb2N1cyBndWFyZHMgKi9cbmxldCBjb3VudCA9IDA7XG5cbmZ1bmN0aW9uIEZvY3VzR3VhcmRzKHByb3BzOiBhbnkpIHtcbiAgdXNlRm9jdXNHdWFyZHMoKTtcbiAgcmV0dXJuIHByb3BzLmNoaWxkcmVuO1xufVxuXG4vKipcbiAqIEluamVjdHMgYSBwYWlyIG9mIGZvY3VzIGd1YXJkcyBhdCB0aGUgZWRnZXMgb2YgdGhlIHdob2xlIERPTSB0cmVlXG4gKiB0byBlbnN1cmUgYGZvY3VzaW5gICYgYGZvY3Vzb3V0YCBldmVudHMgY2FuIGJlIGNhdWdodCBjb25zaXN0ZW50bHkuXG4gKi9cbmZ1bmN0aW9uIHVzZUZvY3VzR3VhcmRzKCkge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGVkZ2VHdWFyZHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1yYWRpeC1mb2N1cy1ndWFyZF0nKTtcbiAgICBkb2N1bWVudC5ib2R5Lmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJiZWdpbicsIGVkZ2VHdWFyZHNbMF0gPz8gY3JlYXRlRm9jdXNHdWFyZCgpKTtcbiAgICBkb2N1bWVudC5ib2R5Lmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlZW5kJywgZWRnZUd1YXJkc1sxXSA/PyBjcmVhdGVGb2N1c0d1YXJkKCkpO1xuICAgIGNvdW50Kys7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKGNvdW50ID09PSAxKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXJhZGl4LWZvY3VzLWd1YXJkXScpLmZvckVhY2goKG5vZGUpID0+IG5vZGUucmVtb3ZlKCkpO1xuICAgICAgfVxuICAgICAgY291bnQtLTtcbiAgICB9O1xuICB9LCBbXSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUZvY3VzR3VhcmQoKSB7XG4gIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXJhZGl4LWZvY3VzLWd1YXJkJywgJycpO1xuICBlbGVtZW50LnRhYkluZGV4ID0gMDtcbiAgZWxlbWVudC5zdHlsZS5vdXRsaW5lID0gJ25vbmUnO1xuICBlbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gIGVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICBlbGVtZW50LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XG4gIHJldHVybiBlbGVtZW50O1xufVxuXG5jb25zdCBSb290ID0gRm9jdXNHdWFyZHM7XG5cbmV4cG9ydCB7XG4gIEZvY3VzR3VhcmRzLFxuICAvL1xuICBSb290LFxuICAvL1xuICB1c2VGb2N1c0d1YXJkcyxcbn07XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/@radix-ui+react-focus-guards@1.1.1_@types+react@19.0.12_react@19.1.0/node_modules/@radix-ui/react-focus-guards/dist/index.mjs\n");

/***/ })

};
;