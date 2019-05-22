// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ipcRenderer } from "electron";
import * as markdownit from "markdown-it";
import "./app.css";

// TODO: should this be necessary?
import "../../../adaptivecards-designer/lib/adaptivecards-designer.css";
import "../../../adaptivecards-designer/node_modules/adaptivecards-controls/lib/adaptivecards-controls.css";

import * as ACDesigner from "../../../adaptivecards-designer/lib/adaptivecards-designer";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

window.onload = async () => {
    (<any>window).globalConfigs = ipcRenderer.sendSync("requestSettings");
    // const rootView = document.createElement("div");
    // document.body.appendChild(rootView);
    // rootView.id = "designerRootHost";

    let hostContainers: Array<ACDesigner.HostContainer> = [
        new ACDesigner.WebChatContainer(
            "Bot Framework WebChat",
            "containers/webchat-container.css"
        ),

        new ACDesigner.CortanaContainer(
            "Cortana Skills",
            "containers/cortana-container.css"
        ),

        new ACDesigner.OutlookContainer(
            "Outlook Actionable Messages",
            "containers/outlook-container.css"
        ),

        new ACDesigner.TimelineContainer(
            "Windows Timeline",
            "containers/timeline-container.css"
        ),

        new ACDesigner.DarkTeamsContainer(
            "Microsoft Teams - Dark",
            "containers/teams-container-dark.css"
        ),

        new ACDesigner.LightTeamsContainer(
            "Microsoft Teams - Light",
            "containers/teams-container-light.css"
        ),

        new ACDesigner.BotFrameworkContainer(
            "Bot Framework Other Channels (Image render)",
            "containers/bf-image-container.css"
        ),

        new ACDesigner.ToastContainer(
            "Windows Notifications (Preview)",
            "containers/toast-container.css"
        )
    ];

    // Comment to disable preview features (data binding)
    // ACDesigner.GlobalSettings.previewFeaturesEnabled = true;

    ACDesigner.CardDesigner.onProcessMarkdown = (text, result) => {
        result.outputHtml = new markdownit().render(text);
        result.didProcess = true;
    };

    if (!ACDesigner.SettingsManager.isLocalStorageAvailable) {
        console.log("Local storage is not available.");
    }

    let designer = new ACDesigner.CardDesigner(hostContainers);
    designer.sampleCatalogueUrl =
        window.location.pathname + "sample-catalogue.json";
    designer.attachTo(document.getElementById("designerRootHost"));
    //#region commented code
    /* Uncomment to test a custom palette item example
    let exampleSnippet = new ACDesigner.SnippetPaletteItem("Custom", "Example");
    exampleSnippet.snippet = {
        type: "ColumnSet",
        columns: [
            {
                width: "auto",
                items: [
                    {
                        type: "Image",
                        size: "Small",
                        style: "Person",
                        url: "https://pbs.twimg.com/profile_images/3647943215/d7f12830b3c17a5a9e4afcc370e3a37e_400x400.jpeg"
                    }
                ]
            },
            {
                width: "stretch",
                items: [
                    {
                        type: "TextBlock",
                        text: "John Doe",
                        weight: "Bolder",
                        wrap: true
                    },
                    {
                        type: "TextBlock",
                        spacing: "None",
                        text: "Additional information",
                        wrap: true
                    }
                ]
            }
        ]
    };

    designer.customPaletteItems = [ exampleSnippet ];
    */
    //#endregion
    designer.monacoModuleLoaded(monaco);
};
