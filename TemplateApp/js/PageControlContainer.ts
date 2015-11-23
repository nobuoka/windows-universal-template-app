/// <reference path="..\typings\winjs\winjs.d.ts" />

namespace vc {
    "use strict";

    export interface IContainedPageControl extends WinJS.UI.Pages.IPageControl {
        unload?(): void;
        // TODO : 複数形？？
        getAnimationElements?(): HTMLElement;
    }

    export class PageControlContainer {
        constructor(element: HTMLElement, options: {}) {
            this._element = element || document.createElement("div");
            WinJS.Utilities.markDisposable(this._element);
            this._element.appendChild(this._createPageElement());
        }

        private _element: HTMLElement = null;
        private _lastNavigationPromise: WinJS.IPromise<any> = WinJS.Promise.as();
        private _lastViewstate: number = 0;
        private _disposed = false;

        // This is the currently loaded Page object.
        get pageControl(): IContainedPageControl {
            return this.pageElement && this.pageElement.winControl;
        }

        // This is the root element of the current page.
        get pageElement(): HTMLElement {
            return <HTMLElement>this._element.firstElementChild;
        }

        // This function disposes the page navigator and its contents.
        dispose(): void {
            if (this._disposed) return;
            this._disposed = true;
            WinJS.Utilities.disposeSubTree(this._element);
        }

        // Creates a container for a new page to be loaded into.
        private _createPageElement(): HTMLDivElement {
            var element = document.createElement("div");
            element.setAttribute("dir", window.getComputedStyle(this._element, null).direction);
            //element.style.position = "absolute";
            element.style.visibility = "hidden";
            element.style.width = "100%";
            element.style.height = "100%";
            return element;
        }

        // Retrieves a list of animation elements for the current page.
        // If the page does not define a list, animate the entire page.
        private _getAnimationElements(): HTMLElement {
            if (this.pageControl && this.pageControl.getAnimationElements) {
                return this.pageControl.getAnimationElements();
            }
            return this.pageElement;
        }

        public setPage(uri: string, options?: any): WinJS.IPromise<any> {
            var newElement = this._createPageElement();
            this._element.appendChild(newElement);

            this._lastNavigationPromise.cancel();

            var cleanup = () => {
                if (this._element.childElementCount > 1) {
                    var oldElement = <HTMLElement>this._element.firstElementChild;
                    // Cleanup and remove previous element
                    if (oldElement.winControl) {
                        if (oldElement.winControl.unload) {
                            oldElement.winControl.unload();
                        }
                        oldElement.winControl.dispose();
                    }
                    oldElement.parentNode.removeChild(oldElement);
                    oldElement.innerText = "";
                }
            }

            this._lastNavigationPromise = WinJS.Promise.as().then(() =>
                WinJS.UI.Pages.render(uri, newElement, options)
            ).then(cleanup, cleanup);

            this._lastNavigationPromise.then(() => {
                this.pageElement.style.visibility = "";
                WinJS.UI.Animation.enterPage(this._getAnimationElements()).done();
            });

            return this._lastNavigationPromise;
        }
    }
    // http://blogs.msdn.com/b/windowsappdev_ja/archive/2012/10/16/javascript-windows-winjs.aspx ここら辺参考に
    WinJS.Utilities.markSupportedForProcessing(PageControlContainer);
}
