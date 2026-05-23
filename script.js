require([
  "esri/config",
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/layers/GraphicsLayer",
  "esri/renderers/ClassBreaksRenderer",
  "esri/Graphic"
], function(
  esriConfig,
  Map,
  MapView,
  FeatureLayer,
  GraphicsLayer,
  ClassBreaksRenderer,
  Graphic
) {

  // =========================================
  // API KEY
  // =========================================

  esriConfig.apiKey =
    "AAPTaym2-xDtI6rZEwZPged0KdA..wcydm107g4Nj21CN1jfTFn3Hlb6Yn2QwULuf6hjqIOK4-DfdJFgRj1WhgoDRnXJ-nvbYBx2fcbGtjLAiZ5NoKBXYkdc4XMsmeTbH2599mc6zZniJ7_TiCXTZmmnBsuyzrICogR1PD-B0ESjggFrrNlzFH78Ksf6ppjRM4-rGnEIa8YiEnU5zFOFX2WVSlWkjOMH5UmhmywBsqbG8BIrQRUzP3vZxuFIrd-hQnsFDxr3FrhmtFs_ZhGNDKX5Gw3fdB8DMtPmBLiEhIhk2W2yRAT1_h0uOKWy8";

  // =========================================
  // CREATE MAP
  // =========================================

  const map = new Map({
    basemap: "topo-vector"
  });

  // =========================================
  // CREATE VIEW
  // =========================================

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [31, 26],
    zoom: 6
  });

  // =========================================
  // GOVERNORATES RENDERER
  // =========================================

  const populationRenderer =
    new ClassBreaksRenderer({

    field: "population",

    classBreakInfos: [

      {
        minValue: 0,
        maxValue: 2000000,

        symbol: {
          type: "simple-fill",

          color: "#d4e6f1",

          outline: {
            color: "white",
            width: 1
          }
        },

        label: "0 - 2 Million"
      },

      {
        minValue: 2000001,
        maxValue: 5000000,

        symbol: {
          type: "simple-fill",

          color: "#7fb3d5",

          outline: {
            color: "white",
            width: 1
          }
        },

        label: "2M - 5M"
      },

      {
        minValue: 5000001,
        maxValue: 10000000,

        symbol: {
          type: "simple-fill",

          color: "#2874a6",

          outline: {
            color: "white",
            width: 1
          }
        },

        label: "5M - 10M"
      },

      {
        minValue: 10000001,
        maxValue: 50000000,

        symbol: {
          type: "simple-fill",

          color: "#154360",

          outline: {
            color: "white",
            width: 1
          }
        },

        label: "10M+"
      }

    ]
  });

  // =========================================
  // GOVERNORATES LAYER
  // =========================================

  const governoratesLayer =
    new FeatureLayer({

    url:
    "https://services3.arcgis.com/DoQL86WSbNbpU3wZ/arcgis/rest/services/Egypt_Gov/FeatureServer",

    renderer: populationRenderer,

    popupTemplate: {

      title: "{name_en}",

      content: `
        <b>Population:</b> {population}<br>
        <b>Area:</b> {Shape__Area}
      `
    }

  });

  map.add(governoratesLayer);

  // =========================================
  // ISSUES GRAPHICS LAYER
  // =========================================

  const issuesLayer =
    new GraphicsLayer();

  map.add(issuesLayer);

  // =========================================
  // REPORTING LOGIC
  // =========================================

  let reportingMode = false;

  const startReportBtn =
    document.getElementById(
      "startReportBtn"
    );

  startReportBtn.addEventListener(
    "click",

    function() {

      reportingMode = true;

      alert(
        "Click on the map to add issue"
      );

    }
  );

  // =========================================
  // MAP CLICK
  // =========================================

  view.on("click", function(event) {

    if (!reportingMode) {
      return;
    }

    // =====================================
    // GET FORM VALUES
    // =====================================

    const issueType =
      document.getElementById(
        "issueType"
      ).value;

    const description =
      document.getElementById(
        "description"
      ).value;

    // =====================================
    // SYMBOL BASED ON ISSUE TYPE
    // =====================================

    let issueSymbol;

    // Violating Building

    if (
      issueType ===
      "Violating Building"
    ) {

      issueSymbol = {

        type: "simple-marker",

        color: "red",

        size: 12,

        outline: {
          color: "white",
          width: 1
        }
      };
    }

    // Street Issue

    else {

      issueSymbol = {

        type: "simple-marker",

        color: "orange",

        size: 12,

        outline: {
          color: "white",
          width: 1
        }
      };
    }

    // =====================================
    // CREATE NEW GRAPHIC
    // =====================================

    const newIssue =
      new Graphic({

      geometry: {

        type: "point",

        longitude:
          event.mapPoint.longitude,

        latitude:
          event.mapPoint.latitude
      },

      symbol: issueSymbol,

      attributes: {

        IssueType: issueType,

        Description: description,

        ReportedAt: new Date()
      },

      popupTemplate: {

        title: "{IssueType}",

        content: `
          <b>Description:</b> {Description}<br>
          <b>Reported At:</b> {ReportedAt}
        `
      }

    });

    // =====================================
    // ADD GRAPHIC TO LAYER
    // =====================================

    issuesLayer.add(newIssue);

    // =====================================
    // SUCCESS MESSAGE
    // =====================================

    alert(
      "Issue Added Successfully"
    );

    // =====================================
    // EXIT REPORTING MODE
    // =====================================

    reportingMode = false;

  });

  // =========================================
  // FILTER ISSUES
  // =========================================

  const filterType =
    document.getElementById(
      "filterType"
    );

  filterType.addEventListener(
    "change",

    function() {

      const selectedType =
        filterType.value;

      // Get All Graphics

      const allGraphics =
        issuesLayer.graphics.items;

      // Loop Through Graphics

      allGraphics.forEach(function(graphic) {

        // Show All

        if (selectedType === "All") {

          graphic.visible = true;
        }

        // Filter

        else {

          if (
            graphic.attributes.IssueType ===
            selectedType
          ) {

            graphic.visible = true;
          }

          else {

            graphic.visible = false;
          }
        }

      });

    }
  );

});