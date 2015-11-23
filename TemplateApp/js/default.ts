/// <reference path="..\typings\bundle.d.ts" />

type IActivatedEventArgs = Windows.ApplicationModel.Activation.IActivatedEventArgs;
interface IDetailedEvnet<T> extends CustomEvent {
    detail: T;
}
interface IDetailedPromiseEvnet<T> extends WinJS.Application.IPromiseEvent, IDetailedEvnet<T> {
    detail: T;
}

(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args: IDetailedPromiseEvnet<IActivatedEventArgs>) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize your application here.
            } else {
                // TODO: This application was suspended and then terminated.
                // To create a smooth user experience, restore application state here so that it looks like the app never stopped running.
            }
            args.setPromise(WinJS.UI.processAll().then(() => {
                var splitView = document.querySelector(".split-view").winControl;
                new (<any>WinJS.UI)._WinKeyboard(splitView.paneElement); // Temporary workaround: Draw keyboard focus visuals on NavBarCommands
                var splitViewCommandsContainer = <HTMLDivElement>document.querySelector(".nav-commands");
                [
                    { label: 'Home', icon: 'home', oninvoked: (args) => { WinJS.Navigation.navigate("/pages/home/home.html") } },
                    { label: 'Favorite', icon: 'favorite' },
                    { label: 'Settings', icon: 'settings', oninvoked: (args) => { WinJS.Navigation.navigate("/pages/setting/setting.html") } },
                ].forEach((opt) => {
                    splitViewCommandsContainer.appendChild(new WinJS.UI.SplitViewCommand(null, opt).element);
                });

                var pageContainer = <vc.PageControlContainer>document.querySelector(".page-container").winControl;
                pageContainer.setPage("/pages/home/home.html");

                WinJS.Navigation.onnavigating = (args: IDetailedEvnet<{
                    location: string; // The URI to navigate to.
                    state: {}; // One or more user- defined key- value pairs.
                    delta: number; // The number of pages traversed forward or backward in the navigation stack.This value is typically + 1, -1, or the value of distance specified in back or forward.
                    setPromise(p: WinJS.IPromise<any>): void;
                }>) => {
                    //args.detail.location, newElement, args.detail.state
                    args.detail.setPromise(pageContainer.setPage(args.detail.location, args.detail.state));
                };
            }));
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
        // You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
        // If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
    };

    app.start();
})();
