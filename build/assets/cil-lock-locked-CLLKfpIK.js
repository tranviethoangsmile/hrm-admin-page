import{r as k,R as E,z as v,_ as R,a as D,c as M,P as b}from"./index-CXj5Q4qR.js";function j(){for(var n=[],o=0;o<arguments.length;o++)n[o]=arguments[o];return k.useMemo(function(){return n.every(function(a){return a==null})?null:function(a){n.forEach(function(i){P(i,a)})}},n)}function P(n,o){if(n!=null)if(_(n))n(o);else try{n.current=o}catch{throw new Error('Cannot assign value "'.concat(o,'" to ref "').concat(n,'"'))}}function _(n){return!!(n&&{}.toString.call(n)=="[object Function]")}function w(n,o){if(n==null)return{};var a={},i=Object.keys(n),e,t;for(t=0;t<i.length;t++)e=i[t],!(o.indexOf(e)>=0)&&(a[e]=n[e]);return a}function N(n,o){return N=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(i,e){return i.__proto__=e,i},N(n,o)}function L(n,o){n.prototype=Object.create(o.prototype),n.prototype.constructor=n,N(n,o)}var g={disabled:!1},O=E.createContext(null),I=function(o){return o.scrollTop},m="unmounted",c="exited",p="entering",h="entered",T="exiting",l=function(n){L(o,n);function o(i,e){var t;t=n.call(this,i,e)||this;var r=e,s=r&&!r.isMounting?i.enter:i.appear,u;return t.appearStatus=null,i.in?s?(u=c,t.appearStatus=p):u=h:i.unmountOnExit||i.mountOnEnter?u=m:u=c,t.state={status:u},t.nextCallback=null,t}o.getDerivedStateFromProps=function(e,t){var r=e.in;return r&&t.status===m?{status:c}:null};var a=o.prototype;return a.componentDidMount=function(){this.updateStatus(!0,this.appearStatus)},a.componentDidUpdate=function(e){var t=null;if(e!==this.props){var r=this.state.status;this.props.in?r!==p&&r!==h&&(t=p):(r===p||r===h)&&(t=T)}this.updateStatus(!1,t)},a.componentWillUnmount=function(){this.cancelNextCallback()},a.getTimeouts=function(){var e=this.props.timeout,t,r,s;return t=r=s=e,e!=null&&typeof e!="number"&&(t=e.exit,r=e.enter,s=e.appear!==void 0?e.appear:r),{exit:t,enter:r,appear:s}},a.updateStatus=function(e,t){if(e===void 0&&(e=!1),t!==null)if(this.cancelNextCallback(),t===p){if(this.props.unmountOnExit||this.props.mountOnEnter){var r=this.props.nodeRef?this.props.nodeRef.current:v.findDOMNode(this);r&&I(r)}this.performEnter(e)}else this.performExit();else this.props.unmountOnExit&&this.state.status===c&&this.setState({status:m})},a.performEnter=function(e){var t=this,r=this.props.enter,s=this.context?this.context.isMounting:e,u=this.props.nodeRef?[s]:[v.findDOMNode(this),s],f=u[0],x=u[1],S=this.getTimeouts(),C=s?S.appear:S.enter;if(!e&&!r||g.disabled){this.safeSetState({status:h},function(){t.props.onEntered(f)});return}this.props.onEnter(f,x),this.safeSetState({status:p},function(){t.props.onEntering(f,x),t.onTransitionEnd(C,function(){t.safeSetState({status:h},function(){t.props.onEntered(f,x)})})})},a.performExit=function(){var e=this,t=this.props.exit,r=this.getTimeouts(),s=this.props.nodeRef?void 0:v.findDOMNode(this);if(!t||g.disabled){this.safeSetState({status:c},function(){e.props.onExited(s)});return}this.props.onExit(s),this.safeSetState({status:T},function(){e.props.onExiting(s),e.onTransitionEnd(r.exit,function(){e.safeSetState({status:c},function(){e.props.onExited(s)})})})},a.cancelNextCallback=function(){this.nextCallback!==null&&(this.nextCallback.cancel(),this.nextCallback=null)},a.safeSetState=function(e,t){t=this.setNextCallback(t),this.setState(e,t)},a.setNextCallback=function(e){var t=this,r=!0;return this.nextCallback=function(s){r&&(r=!1,t.nextCallback=null,e(s))},this.nextCallback.cancel=function(){r=!1},this.nextCallback},a.onTransitionEnd=function(e,t){this.setNextCallback(t);var r=this.props.nodeRef?this.props.nodeRef.current:v.findDOMNode(this),s=e==null&&!this.props.addEndListener;if(!r||s){setTimeout(this.nextCallback,0);return}if(this.props.addEndListener){var u=this.props.nodeRef?[this.nextCallback]:[r,this.nextCallback],f=u[0],x=u[1];this.props.addEndListener(f,x)}e!=null&&setTimeout(this.nextCallback,e)},a.render=function(){var e=this.state.status;if(e===m)return null;var t=this.props,r=t.children;t.in,t.mountOnEnter,t.unmountOnExit,t.appear,t.enter,t.exit,t.timeout,t.addEndListener,t.onEnter,t.onEntering,t.onEntered,t.onExit,t.onExiting,t.onExited,t.nodeRef;var s=w(t,["children","in","mountOnEnter","unmountOnExit","appear","enter","exit","timeout","addEndListener","onEnter","onEntering","onEntered","onExit","onExiting","onExited","nodeRef"]);return E.createElement(O.Provider,{value:null},typeof r=="function"?r(e,s):E.cloneElement(E.Children.only(r),s))},o}(E.Component);l.contextType=O;l.propTypes={};function d(){}l.defaultProps={in:!1,mountOnEnter:!1,unmountOnExit:!1,appear:!1,enter:!0,exit:!0,onEnter:d,onEntering:d,onEntered:d,onExit:d,onExiting:d,onExited:d};l.UNMOUNTED=m;l.EXITED=c;l.ENTERING=p;l.ENTERED=h;l.EXITING=T;var G=l,y=k.forwardRef(function(n,o){var a=n.className,i=n.dark,e=n.disabled,t=n.white,r=R(n,["className","dark","disabled","white"]);return E.createElement("button",D({type:"button",className:M("btn","btn-close",{"btn-close-white":t},e,a),"aria-label":"Close",disabled:e},i&&{"data-coreui-theme":"dark"},r,{ref:o}))});y.propTypes={className:b.string,dark:b.bool,disabled:b.bool,white:b.bool};y.displayName="CCloseButton";var F=["512 512","<path fill='var(--ci-primary-color, currentColor)' d='M384,200V144a128,128,0,0,0-256,0v56H88V328c0,92.635,75.364,168,168,168s168-75.365,168-168V200ZM160,144a96,96,0,0,1,192,0v56H160ZM392,328c0,74.99-61.01,136-136,136s-136-61.01-136-136V232H392Z' class='ci-primary'/>"];export{y as C,G as T,F as c,j as u};
