export type EndpointMapsList_OutputOK = {
  id: string;
  name: string;
  country: string;
  lineCount: number;
  stationCount: number;
  lines: {
    color: string;
    name: string;
    code: string;
    path: number[][];
  }[];
  stations: {
    id: string;
    x: number;
    y: number;
    name: string;
    lines: string[];
    type: "station" | "interchange";
    codes?: string[];
    textOffsetX?: number;
    textOffsetY?: number;
    textAnchor?: string;
  }[];
}[];
export type EndpointSignsList_OutputOK = {
  id: string;
  image: string;
  station_code: string;
  cropped_image: string;
  crop_coords: {
    topLeft: {
      x: number;
      y: number;
    };
    topRight: {
      x: number;
      y: number;
    };
    bottomRight: {
      x: number;
      y: number;
    };
    bottomLeft: {
      x: number;
      y: number;
    };
  } | null;
  created: string;
  updated: string;
}[];
export type EndpointSignsRemove_OutputNO_CONTENT = void;

export interface Contract {
  maps: {
    create: EndpointMapsCreate;
    get: EndpointMapsGet;
    list: EndpointMapsList;
    update: EndpointMapsUpdate;
  };
  signs: {
    list: EndpointSignsList;
    remove: EndpointSignsRemove;
    update: EndpointSignsUpdate;
    upload: EndpointSignsUpload;
  };
}
export interface EndpointMapsCreate {
  method: "post";
  input: {
    body?: EndpointMapsCreate_InputBody;
  };
  output: {
    CREATED: EndpointMapsCreate_OutputCREATED;
  };
  media: null;
}
export interface EndpointMapsCreate_InputBody {
  name: string;
  country: string;
  lines: {
    color: string;
    name: string;
    code: string;
    path: number[][];
  }[];
  stations: {
    id: string;
    x: number;
    y: number;
    name: string;
    lines: string[];
    type: "station" | "interchange";
    codes?: string[];
    textOffsetX?: number;
    textOffsetY?: number;
    textAnchor?: string;
  }[];
}
export interface EndpointMapsCreate_OutputCREATED {
  id: string;
  name: string;
  country: string;
  lines: {
    color: string;
    name: string;
    code: string;
    path: number[][];
  }[];
  stations: {
    id: string;
    x: number;
    y: number;
    name: string;
    lines: string[];
    type: "station" | "interchange";
    codes?: string[];
    textOffsetX?: number;
    textOffsetY?: number;
    textAnchor?: string;
  }[];
  created: string;
  updated: string;
}
export interface EndpointMapsGet {
  method: "get";
  input: {
    query?: EndpointMapsGet_InputQuery;
  };
  output: {
    OK: EndpointMapsGet_OutputOK;
  };
  media: null;
}
export interface EndpointMapsGet_InputQuery {
  id: string;
}
export interface EndpointMapsGet_OutputOK {
  id: string;
  name: string;
  country: string;
  lines: {
    color: string;
    name: string;
    code: string;
    path: number[][];
  }[];
  stations: {
    id: string;
    x: number;
    y: number;
    name: string;
    lines: string[];
    type: "station" | "interchange";
    codes?: string[];
    textOffsetX?: number;
    textOffsetY?: number;
    textAnchor?: string;
  }[];
  created: string;
  updated: string;
}
export interface EndpointMapsList {
  method: "get";
  input: {};
  output: {
    OK: EndpointMapsList_OutputOK;
  };
  media: null;
}
export interface EndpointMapsUpdate {
  method: "post";
  input: {
    query?: EndpointMapsUpdate_InputQuery;
    body?: EndpointMapsUpdate_InputBody;
  };
  output: {
    OK: EndpointMapsUpdate_OutputOK;
  };
  media: null;
}
export interface EndpointMapsUpdate_InputQuery {
  id: string;
}
export interface EndpointMapsUpdate_InputBody {
  stationId: string;
  name: string;
}
export interface EndpointMapsUpdate_OutputOK {
  id: string;
  name: string;
  country: string;
  lines: {
    color: string;
    name: string;
    code: string;
    path: number[][];
  }[];
  stations: {
    id: string;
    x: number;
    y: number;
    name: string;
    lines: string[];
    type: "station" | "interchange";
    codes?: string[];
    textOffsetX?: number;
    textOffsetY?: number;
    textAnchor?: string;
  }[];
  created: string;
  updated: string;
}
export interface EndpointSignsList {
  method: "get";
  input: {};
  output: {
    OK: EndpointSignsList_OutputOK;
  };
  media: null;
}
export interface EndpointSignsRemove {
  method: "post";
  input: {
    query?: EndpointSignsRemove_InputQuery;
  };
  output: {
    NO_CONTENT: EndpointSignsRemove_OutputNO_CONTENT;
  };
  media: null;
}
export interface EndpointSignsRemove_InputQuery {
  id: string;
}
export interface EndpointSignsUpdate {
  method: "post";
  input: {
    query?: EndpointSignsUpdate_InputQuery;
    body?: EndpointSignsUpdate_InputBody;
  };
  output: {
    CREATED: EndpointSignsUpdate_OutputCREATED;
  };
  media: {image: {optional: false}};
}
export interface EndpointSignsUpdate_InputQuery {
  id: string;
}
export interface EndpointSignsUpdate_InputBody {
  coords: {
    topLeft: {
      x: number;
      y: number;
    };
    topRight: {
      x: number;
      y: number;
    };
    bottomRight: {
      x: number;
      y: number;
    };
    bottomLeft: {
      x: number;
      y: number;
    };
  };
}
export interface EndpointSignsUpdate_OutputCREATED {
  id: string;
  image: string;
  station_code: string;
  cropped_image: string;
  crop_coords: {
    topLeft: {
      x: number;
      y: number;
    };
    topRight: {
      x: number;
      y: number;
    };
    bottomRight: {
      x: number;
      y: number;
    };
    bottomLeft: {
      x: number;
      y: number;
    };
  } | null;
  created: string;
  updated: string;
}
export interface EndpointSignsUpload {
  method: "post";
  input: {
    body?: EndpointSignsUpload_InputBody;
  };
  output: {
    CREATED: EndpointSignsUpload_OutputCREATED;
  };
  media: {image: {optional: false}};
}
export interface EndpointSignsUpload_InputBody {
  station_code: string;
  coords: {
    topLeft: {
      x: number;
      y: number;
    };
    topRight: {
      x: number;
      y: number;
    };
    bottomRight: {
      x: number;
      y: number;
    };
    bottomLeft: {
      x: number;
      y: number;
    };
  };
}
export interface EndpointSignsUpload_OutputCREATED {
  id: string;
  image: string;
  station_code: string;
  cropped_image: string;
  crop_coords: {
    topLeft: {
      x: number;
      y: number;
    };
    topRight: {
      x: number;
      y: number;
    };
    bottomRight: {
      x: number;
      y: number;
    };
    bottomLeft: {
      x: number;
      y: number;
    };
  } | null;
  created: string;
  updated: string;
}
