import Svg, { Circle, G, NumberProp, Path, Rect } from 'react-native-svg';

export const MarkerCloudSVG = ({
  width,
  height,
}: {
  width: NumberProp | undefined;
  height: NumberProp | undefined;
}) => {
  return (
    <Svg x="0px" y="0px" width={width} height={height} viewBox="0,0,256,256">
      <G transform="translate(-25.6,-25.6) scale(1.2,1.2)">
        <G
          fill="none"
          fill-rule="nonzero"
          stroke="none"
          strokeWidth="1"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeMiterlimit="10"
          strokeDashoffset="0"
          style="mix-blend-mode: normal">
          <G transform="scale(2.56,2.56)">
            <Path
              d="M87.215,56.71c1.135,-2.155 1.785,-4.605 1.785,-7.21c0,-6.621 -4.159,-12.257 -10.001,-14.478c0,-0.007 0.001,-0.014 0.001,-0.022c0,-11.598 -9.402,-21 -21,-21c-9.784,0 -17.981,6.701 -20.313,15.757c-1.476,-0.485 -3.049,-0.757 -4.687,-0.757c-7.692,0 -14.023,5.793 -14.89,13.252c-5.204,1.101 -9.11,5.717 -9.11,11.248c0,6.351 5.149,11.5 11.5,11.5c0.177,0 0.352,-0.012 0.526,-0.022c-0.004,0.175 -0.026,0.346 -0.026,0.522c0,11.322 9.178,20.5 20.5,20.5c6.437,0 12.175,-2.972 15.934,-7.614c2.178,2.225 5.206,3.614 8.566,3.614c4.65,0 8.674,-2.65 10.666,-6.518c1.052,0.335 2.171,0.518 3.334,0.518c6.075,0 11,-4.925 11,-11c0,-3.311 -1.47,-6.273 -3.785,-8.29z"
              fill="#c7ede6"
            />
            <Path
              d="M81.445,62.545c0.022,-0.181 0.055,-0.358 0.055,-0.545c0,-2.485 -2.015,-4.5 -4.5,-4.5c-1.438,0 -2.703,0.686 -3.527,1.736c-0.14,-2.636 -2.302,-4.736 -4.973,-4.736c-2.259,0 -4.146,1.508 -4.766,3.565c-0.149,-0.043 -0.303,-0.073 -0.465,-0.073c-0.894,0 -1.618,0.698 -1.674,1.578c-0.195,-0.036 -0.39,-0.07 -0.595,-0.07c-1.781,0 -3.234,1.335 -3.455,3.055c-0.181,-0.022 -0.358,-0.055 -0.545,-0.055c-2.485,0 -4.5,2.015 -4.5,4.5c0,2.485 2.015,4.5 4.5,4.5c2.485,0 9.5,0 9.5,0h5.375v0.5h3v-0.5c0,0 3.64,0 6.125,0c2.485,0 4.5,-2.015 4.5,-4.5c0,-2.333 -1.782,-4.229 -4.055,-4.455z"
              fill="#fdfcef"
            />
            <Path
              d="M80.883,62.5c-1.326,0 -2.508,0.897 -2.874,2.182c-0.038,0.133 0.039,0.271 0.172,0.309c0.024,0.006 0.047,0.009 0.069,0.009c0.109,0 0.209,-0.072 0.24,-0.182c0.305,-1.07 1.289,-1.818 2.393,-1.818c0.117,0 0.23,0.014 0.342,0.029c0.012,0.002 0.023,0.003 0.035,0.003c0.121,0 0.229,-0.092 0.246,-0.217c0.019,-0.137 -0.077,-0.263 -0.214,-0.281c-0.134,-0.018 -0.27,-0.034 -0.409,-0.034z"
              fill="#472b29"
            />
            <Path
              d="M81.997,62.123c0.002,-0.041 0.003,-0.082 0.003,-0.123c0,-2.757 -2.243,-5 -5,-5c-1.176,0 -2.293,0.416 -3.183,1.164c-0.598,-2.404 -2.762,-4.164 -5.317,-4.164c-1.83,0 -3.45,0.902 -4.451,2.282c0.269,0.237 0.497,0.497 0.682,0.774c0.804,-1.235 2.19,-2.056 3.769,-2.056c2.381,0 4.347,1.872 4.474,4.263c0.011,0.208 0.15,0.387 0.349,0.45c0.05,0.016 0.101,0.024 0.152,0.024c0.15,0 0.296,-0.069 0.392,-0.192c0.771,-0.982 1.912,-1.545 3.133,-1.545c2.206,0 4,1.794 4,4c0,0.117 -0.017,0.23 -0.032,0.343l-0.019,0.141c-0.016,0.134 0.022,0.268 0.106,0.373c0.084,0.105 0.207,0.172 0.34,0.185c2.056,0.205 3.605,1.907 3.605,3.958c0,2.206 -1.794,4 -4,4h-6.125c-0.276,0 -0.5,0.224 -0.5,0.5c0,0.276 0.224,0.5 0.5,0.5h6.125c2.757,0 5,-2.243 5,-5c0,-2.397 -1.689,-4.413 -4.003,-4.877z"
              fill="#472b29"
            />
            <Path
              d="M71.875,71h-14.875c-2.206,0 -4,-1.794 -4,-4c0,-2.206 1.794,-4 4,-4c0.117,0 0.23,0.017 0.343,0.032l0.141,0.019c0.021,0.003 0.041,0.004 0.062,0.004c0.246,0 0.462,-0.185 0.495,-0.437c0.009,-0.073 0.033,-0.14 0.047,-0.211c-0.438,-0.094 -0.85,-0.229 -1.234,-0.393c-2.688,0.08 -4.854,2.279 -4.854,4.986c0,2.757 2.243,5 5,5h14.875c0.276,0 0.5,-0.224 0.5,-0.5c0,-0.276 -0.224,-0.5 -0.5,-0.5z"
              fill="#472b29"
            />
            <Path
              d="M67.818,61.126c-0.301,-0.086 -0.562,-0.126 -0.818,-0.126c-1.403,0 -2.609,0.999 -2.913,2.341c-0.367,-0.222 -0.786,-0.341 -1.212,-0.341c-1.202,0 -2.198,0.897 -2.353,2.068c-0.203,-0.046 -0.396,-0.068 -0.584,-0.068c-1.09,0 -2.046,0.616 -2.549,1.522c0.159,0.069 0.306,0.148 0.435,0.242c0.417,-0.752 1.209,-1.264 2.113,-1.264c0.229,0 0.47,0.042 0.738,0.127c0.022,0.007 0.044,0.01 0.067,0.01c0.055,0 0.11,-0.02 0.156,-0.054c0.064,-0.046 0.102,-0.128 0.102,-0.208c0,-1.034 0.841,-1.875 1.875,-1.875c0.447,0 0.885,0.168 1.231,0.473c0.047,0.041 0.106,0.063 0.165,0.063c0.032,0 0.064,-0.006 0.093,-0.019c0.088,-0.035 0.148,-0.117 0.155,-0.212c0.104,-1.293 1.193,-2.305 2.481,-2.305c0.208,0 0.425,0.034 0.682,0.107c0.023,0.007 0.047,0.01 0.07,0.01c0.109,0 0.207,-0.073 0.239,-0.182c0.037,-0.133 -0.04,-0.271 -0.173,-0.309z"
              fill="#472b29"
            />
            <Path
              d="M30,73h-9.905c-0.276,0 -0.5,-0.224 -0.5,-0.5c0,-0.276 0.224,-0.5 0.5,-0.5h9.905c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.223,0.5 -0.5,0.5z"
              fill="#ffffff"
            />
            <Path
              d="M33.095,73h-1c-0.276,0 -0.5,-0.224 -0.5,-0.5c0,-0.276 0.224,-0.5 0.5,-0.5h1c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.223,0.5 -0.5,0.5z"
              fill="#ffffff"
            />
            <Path
              d="M38.086,75h-8.991c-0.276,0 -0.5,-0.224 -0.5,-0.5c0,-0.276 0.224,-0.5 0.5,-0.5h8.991c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.224,0.5 -0.5,0.5z"
              fill="#ffffff"
            />
            <Path
              d="M27.095,75h-1c-0.276,0 -0.5,-0.224 -0.5,-0.5c0,-0.276 0.224,-0.5 0.5,-0.5h1c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.223,0.5 -0.5,0.5z"
              fill="#ffffff"
            />
            <Path
              d="M24.095,75h-2c-0.276,0 -0.5,-0.224 -0.5,-0.5c0,-0.276 0.224,-0.5 0.5,-0.5h2c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.223,0.5 -0.5,0.5z"
              fill="#ffffff"
            />
            <Path
              d="M30.095,77h-2c-0.276,0 -0.5,-0.224 -0.5,-0.5c0,-0.276 0.224,-0.5 0.5,-0.5h2c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.224,0.5 -0.5,0.5z"
              fill="#ffffff"
            />
            <Path
              d="M33.095,68c-0.177,0 -0.823,0 -1,0c-0.276,0 -0.5,0.224 -0.5,0.5c0,0.276 0.224,0.5 0.5,0.5c0.177,0 0.823,0 1,0c0.276,0 0.5,-0.224 0.5,-0.5c0,-0.276 -0.224,-0.5 -0.5,-0.5z"
              fill="#ffffff"
            />
            <Path
              d="M33.095,70c-0.177,0 -4.823,0 -5,0c-0.276,0 -0.5,0.224 -0.5,0.5c0,0.276 0.224,0.5 0.5,0.5c0.177,0 4.823,0 5,0c0.276,0 0.5,-0.224 0.5,-0.5c0,-0.276 -0.224,-0.5 -0.5,-0.5z"
              fill="#ffffff"
            />
            <Path
              d="M38.095,72c-0.177,0 -2.823,0 -3,0c-0.276,0 -0.5,0.224 -0.5,0.5c0,0.276 0.224,0.5 0.5,0.5c0.177,0 2.823,0 3,0c0.276,0 0.5,-0.224 0.5,-0.5c0,-0.276 -0.224,-0.5 -0.5,-0.5z"
              fill="#ffffff"
            />
            <G fill="#ffffff">
              <Path d="M72.5,24h-10c-0.276,0 -0.5,-0.224 -0.5,-0.5c0,-0.276 0.224,-0.5 0.5,-0.5h10c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.224,0.5 -0.5,0.5z" />
              <Path d="M76.5,24h-2c-0.276,0 -0.5,-0.224 -0.5,-0.5c0,-0.276 0.224,-0.5 0.5,-0.5h2c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.224,0.5 -0.5,0.5z" />
              <Path d="M81.5,26h-10c-0.276,0 -0.5,-0.224 -0.5,-0.5c0,-0.276 0.224,-0.5 0.5,-0.5h10c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.223,0.5 -0.5,0.5z" />
              <Path d="M69.5,26h-1c-0.276,0 -0.5,-0.224 -0.5,-0.5c0,-0.276 0.224,-0.5 0.5,-0.5h1c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.224,0.5 -0.5,0.5z" />
              <Path d="M66.375,26h-1.875c-0.276,0 -0.5,-0.224 -0.5,-0.5c0,-0.276 0.224,-0.5 0.5,-0.5h1.875c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.224,0.5 -0.5,0.5z" />
              <Path d="M75.5,22h-5c-0.276,0 -0.5,-0.224 -0.5,-0.5c0,-0.276 0.224,-0.5 0.5,-0.5h5c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.223,0.5 -0.5,0.5z" />
              <Path d="M72.5,28h-2c-0.276,0 -0.5,-0.224 -0.5,-0.5c0,-0.276 0.224,-0.5 0.5,-0.5h2c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.224,0.5 -0.5,0.5z" />
            </G>
            <G>
              <Path
                d="M57.55,43.933c0,1.63 -0.559,3.127 -1.487,4.321h0.12v0.097l11.166,-13.151c-2.163,-4.382 -5.975,-7.792 -10.634,-9.426l-11.137,13.117c1.271,-1.241 3.006,-2.008 4.922,-2.008c3.894,0 7.05,3.157 7.05,7.05z"
                fill="#4792dd"
              />
              <Path
                d="M55.221,49.216v-0.057c-1.25,1.131 -2.903,1.825 -4.721,1.825c-3.894,0 -7.05,-3.156 -7.05,-7.05c0,-1.507 0.477,-2.901 1.283,-4.047l-10.725,12.63c1.596,2.845 5.204,7.148 8.512,11.925l12.929,-15.227h-0.228z"
                fill="#fcc938"
              />
              <Path
                d="M42.52,64.443c0.697,1.006 1.381,2.031 2.028,3.069c3.033,4.864 3.553,10.768 5.951,10.768c2.184,0 3.473,-6.323 6.392,-11.142c3.652,-6.03 8.053,-11.08 9.863,-14.187c1.618,-2.777 2.545,-6.005 2.545,-9.451c0,-2.984 -0.714,-5.794 -1.951,-8.3z"
                fill="#068e8a"
              />
              <Path
                d="M45.578,38.891l11.137,-13.117c-1.948,-0.683 -4.034,-1.074 -6.215,-1.074c-5.741,0 -10.872,2.581 -14.321,6.636l9.174,7.789c0.075,-0.079 0.147,-0.158 0.225,-0.234z"
                fill="#1e65d6"
              />
              <Path
                d="M45.354,39.126l-9.174,-7.789c-2.789,3.279 -4.48,7.521 -4.48,12.163c0,3.098 0.749,6.02 2.076,8.597c0.069,0.134 0.153,0.279 0.232,0.421l10.724,-12.631c0.19,-0.269 0.398,-0.522 0.622,-0.761z"
                fill="#e55838"
              />
            </G>
            <G fill="#472b29">
              <Path d="M50.5,78.98c-1.888,0 -2.739,-2.264 -3.816,-5.129c-0.707,-1.88 -1.508,-4.011 -2.729,-5.969c-0.586,-0.939 -1.244,-1.934 -2.01,-3.042c-1.386,-2.001 -2.839,-3.931 -4.122,-5.633c-1.823,-2.42 -3.397,-4.51 -4.344,-6.197l-0.087,-0.162c-0.111,-0.196 -0.18,-0.318 -0.239,-0.433c-1.408,-2.733 -2.153,-5.816 -2.153,-8.915c0,-4.613 1.65,-9.094 4.646,-12.617c3.719,-4.374 9.133,-6.883 14.854,-6.883c2.173,0 4.342,0.375 6.447,1.113c4.769,1.673 8.789,5.236 11.03,9.776c1.342,2.719 2.023,5.616 2.023,8.611c0,3.449 -0.913,6.839 -2.64,9.803c-0.811,1.391 -2.112,3.141 -3.62,5.167c-1.973,2.654 -4.21,5.662 -6.25,9.03c-1.107,1.828 -1.987,3.909 -2.764,5.745c-1.408,3.33 -2.426,5.735 -4.226,5.735zM50.5,25.4c-5.309,0 -10.334,2.329 -13.787,6.39c-2.781,3.271 -4.313,7.429 -4.313,11.71c0,2.917 0.672,5.702 1.998,8.276c0.052,0.101 0.111,0.205 0.17,0.31l0.137,0.25c0.895,1.595 2.443,3.65 4.235,6.029c1.29,1.712 2.752,3.653 4.155,5.678c0.779,1.126 1.449,2.139 2.046,3.097c1.295,2.076 2.122,4.276 2.852,6.217c0.816,2.171 1.587,4.221 2.506,4.221c0.872,0 1.969,-2.592 2.937,-4.879c0.795,-1.88 1.697,-4.011 2.856,-5.925c2.074,-3.425 4.431,-6.593 6.324,-9.14c1.482,-1.993 2.762,-3.714 3.533,-5.037c1.603,-2.75 2.449,-5.896 2.449,-9.098c0,-2.778 -0.632,-5.466 -1.878,-7.99c-2.081,-4.215 -5.813,-7.523 -10.238,-9.075c-1.954,-0.686 -3.967,-1.034 -5.982,-1.034z" />
            </G>
            <G fill="#472b29">
              <Path d="M50.5,51c-4.135,0 -7.5,-3.365 -7.5,-7.5c0,-4.135 3.365,-7.5 7.5,-7.5c4.135,0 7.5,3.365 7.5,7.5c0,4.135 -3.365,7.5 -7.5,7.5zM50.5,37.4c-3.363,0 -6.1,2.736 -6.1,6.1c0,3.364 2.736,6.1 6.1,6.1c3.364,0 6.1,-2.736 6.1,-6.1c0,-3.364 -2.737,-6.1 -6.1,-6.1z" />
            </G>
            <G fill="#472b29">
              <Rect
                x="47.80888"
                y="-0.19044"
                transform="rotate(40.494)"
                width="11.977"
                height="1"
              />
            </G>
            <G fill="#472b29">
              <Path d="M34.25,52.38c-0.115,0 -0.23,-0.04 -0.325,-0.12c-0.21,-0.18 -0.235,-0.495 -0.056,-0.705l3.247,-3.802c0.18,-0.209 0.496,-0.234 0.705,-0.056c0.21,0.18 0.235,0.495 0.056,0.705l-3.247,3.802c-0.099,0.116 -0.239,0.176 -0.38,0.176zM39.445,46.296c-0.115,0 -0.23,-0.04 -0.325,-0.12c-0.21,-0.18 -0.235,-0.495 -0.056,-0.705l16.976,-19.879c0.18,-0.209 0.496,-0.234 0.705,-0.056c0.21,0.18 0.235,0.495 0.056,0.705l-16.976,19.88c-0.099,0.115 -0.239,0.175 -0.38,0.175z" />
            </G>
            <G fill="#472b29">
              <Path d="M42.58,64.68c-0.115,0 -0.23,-0.04 -0.325,-0.12c-0.21,-0.18 -0.235,-0.495 -0.056,-0.705l20.78,-24.335c0.18,-0.21 0.495,-0.233 0.705,-0.056c0.21,0.18 0.235,0.495 0.056,0.705l-20.78,24.336c-0.099,0.116 -0.239,0.175 -0.38,0.175zM65.308,38.064c-0.115,0 -0.23,-0.04 -0.325,-0.12c-0.21,-0.18 -0.235,-0.495 -0.056,-0.705l1.784,-2.089c0.18,-0.21 0.496,-0.234 0.705,-0.056c0.21,0.18 0.235,0.495 0.056,0.705l-1.784,2.089c-0.099,0.116 -0.239,0.176 -0.38,0.176z" />
            </G>
            <G>
              <Path
                d="M34,37.5c0,0 1.567,0 3.5,0c1.933,0 3.5,-1.567 3.5,-3.5c0,-1.781 -1.335,-3.234 -3.055,-3.455c0.028,-0.179 0.055,-0.358 0.055,-0.545c0,-1.933 -1.567,-3.5 -3.5,-3.5c-1.032,0 -1.95,0.455 -2.59,1.165c-0.385,-1.808 -1.988,-3.165 -3.91,-3.165c-2.209,0 -4,1.791 -4,4c0,0.191 0.03,0.374 0.056,0.558c-0.428,-0.344 -0.964,-0.558 -1.556,-0.558c-1.228,0 -2.245,0.887 -2.455,2.055c-0.179,-0.028 -0.358,-0.055 -0.545,-0.055c-1.933,0 -3.5,1.567 -3.5,3.5c0,1.933 1.567,3.5 3.5,3.5c1.933,0 7.5,0 7.5,0v0.5h7z"
                fill="#fdfcef"
              />
              <Path
                d="M35.75,33c-0.138,0 -0.25,-0.112 -0.25,-0.25c0,-1.223 0.995,-2.218 2.218,-2.218c0.034,0.009 0.737,-0.001 1.244,0.136c0.133,0.036 0.212,0.173 0.176,0.306c-0.036,0.134 -0.173,0.213 -0.306,0.176c-0.444,-0.12 -1.1,-0.12 -1.113,-0.118c-0.948,0 -1.719,0.771 -1.719,1.718c0,0.138 -0.112,0.25 -0.25,0.25z"
                fill="#472b29"
              />
              <Circle cx="29" cy="37.5" r="0.5" fill="#472b29" />
              <Path
                d="M37.5,38h-3.5c-0.276,0 -0.5,-0.224 -0.5,-0.5c0,-0.276 0.224,-0.5 0.5,-0.5h3.5c1.654,0 3,-1.346 3,-3c0,-1.496 -1.125,-2.768 -2.618,-2.959c-0.134,-0.018 -0.255,-0.088 -0.336,-0.196c-0.081,-0.108 -0.115,-0.244 -0.094,-0.377c0.023,-0.154 0.048,-0.308 0.048,-0.468c0,-1.654 -1.346,-3 -3,-3c-0.85,0 -1.638,0.355 -2.219,1c-0.125,0.139 -0.321,0.198 -0.5,0.148c-0.182,-0.049 -0.321,-0.195 -0.36,-0.379c-0.341,-1.604 -1.78,-2.769 -3.421,-2.769c-1.93,0 -3.5,1.57 -3.5,3.5c0,0.143 0.021,0.28 0.041,0.418c0.029,0.203 -0.063,0.438 -0.242,0.54c-0.179,0.102 -0.396,0.118 -0.556,-0.01c-0.365,-0.293 -0.794,-0.448 -1.243,-0.448c-0.966,0 -1.792,0.691 -1.963,1.644c-0.048,0.267 -0.296,0.446 -0.569,0.405c-0.154,-0.024 -0.308,-0.049 -0.468,-0.049c-1.654,0 -3,1.346 -3,3c0,1.654 1.346,3 3,3h7.5c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.224,0.5 -0.5,0.5h-7.5c-2.206,0 -4,-1.794 -4,-4c0,-2.206 1.794,-4 4,-4c0.059,0 0.116,0.002 0.174,0.006c0.414,-1.186 1.537,-2.006 2.826,-2.006c0.349,0 0.689,0.061 1.011,0.18c0.165,-2.333 2.115,-4.18 4.489,-4.18c1.831,0 3.466,1.127 4.153,2.774c0.68,-0.498 1.502,-0.774 2.347,-0.774c2.206,0 4,1.794 4,4c0,0.048 -0.001,0.095 -0.004,0.142c1.743,0.448 3.004,2.027 3.004,3.858c0,2.206 -1.794,4 -4,4z"
                fill="#472b29"
              />
              <Path
                d="M32,37c-0.159,0 -0.841,0 -1,0c-0.276,0 -0.5,0.224 -0.5,0.5c0,0.276 0.224,0.5 0.5,0.5c0.159,0 0.841,0 1,0c0.276,0 0.5,-0.224 0.5,-0.5c0,-0.276 -0.224,-0.5 -0.5,-0.5z"
                fill="#472b29"
              />
            </G>
          </G>
        </G>
      </G>
    </Svg>
  );
};