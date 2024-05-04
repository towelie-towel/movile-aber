import { useColorScheme } from 'react-native';
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';

export const ColorInstagram = ({ color = false }) => {
    const colorScheme = useColorScheme();
    const lineColor = colorScheme === 'light' || color ? '#000' : '#fff';
    return (
        <Svg x="0px" y="0px" width="30" height="30" viewBox="0,0,256,256">
            {
                color ? <Defs>
                    <RadialGradient
                        cx="19.38"
                        cy="42.035"
                        r="44.899"
                        gradientUnits="userSpaceOnUse"
                        id="color-1_Xy10Jcu1L2Su_gr1">
                        <Stop offset="0" stopColor="#ffdd55" />
                        <Stop offset="0.328" stopColor="#ff543f" />
                        <Stop offset="0.348" stopColor="#fc5245" />
                        <Stop offset="0.504" stopColor="#e64771" />
                        <Stop offset="0.643" stopColor="#d53e91" />
                        <Stop offset="0.761" stopColor="#cc39a4" />
                        <Stop offset="0.841" stopColor="#c837ab" />
                    </RadialGradient>
                    <RadialGradient
                        cx="11.786"
                        cy="5.5403"
                        r="29.813"
                        gradientUnits="userSpaceOnUse"
                        id="color-2_Xy10Jcu1L2Su_gr2">
                        <Stop offset="0" stopColor="#4168c9" />
                        <Stop offset="0.999" stopColor="#4168c9" stopOpacity="0" />
                    </RadialGradient>
                </Defs> : null
            }

            <G transform={color ? "translate(-38.4,-38.4) scale(1.3,1.3)" : "translate(-98.4,-98.4) scale(1.8,1.8)"}>
                <G
                    fillRule="nonzero"
                    strokeWidth="1"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeMiterlimit="10"
                    strokeDashoffset="0"
                    style="mix-blend-mode: normal">
                    <G transform="scale(5.33333,5.33333)">
                        <Path
                            d="M34.017,41.99l-20,0.019c-4.4,0.004 -8.003,-3.592 -8.008,-7.992l-0.019,-20c-0.004,-4.4 3.592,-8.003 7.992,-8.008l20,-0.019c4.4,-0.004 8.003,3.592 8.008,7.992l0.019,20c0.005,4.401 -3.592,8.004 -7.992,8.008z"
                            fill="url(#color-1_Xy10Jcu1L2Su_gr1)"
                        />
                        <Path
                            d="M34.017,41.99l-20,0.019c-4.4,0.004 -8.003,-3.592 -8.008,-7.992l-0.019,-20c-0.004,-4.4 3.592,-8.003 7.992,-8.008l20,-0.019c4.4,-0.004 8.003,3.592 8.008,7.992l0.019,20c0.005,4.401 -3.592,8.004 -7.992,8.008z"
                            fill="url(#color-2_Xy10Jcu1L2Su_gr2)"
                        />
                        <Path
                            d="M24,31c-3.859,0 -7,-3.14 -7,-7c0,-3.86 3.141,-7 7,-7c3.859,0 7,3.14 7,7c0,3.86 -3.141,7 -7,7zM24,19c-2.757,0 -5,2.243 -5,5c0,2.757 2.243,5 5,5c2.757,0 5,-2.243 5,-5c0,-2.757 -2.243,-5 -5,-5z"
                            fill={lineColor}
                        />
                        <Circle cx="31.5" cy="16.5" r="1.5" fill={lineColor} />
                        <Path
                            d="M30,37h-12c-3.859,0 -7,-3.14 -7,-7v-12c0,-3.86 3.141,-7 7,-7h12c3.859,0 7,3.14 7,7v12c0,3.86 -3.141,7 -7,7zM18,13c-2.757,0 -5,2.243 -5,5v12c0,2.757 2.243,5 5,5h12c2.757,0 5,-2.243 5,-5v-12c0,-2.757 -2.243,-5 -5,-5z"
                            fill={lineColor}
                        />
                    </G>
                </G>
            </G>
        </Svg>
    )
}

export const ColorFacebook = ({ color = false }) => {
    const colorScheme = useColorScheme();

    const bgColor = colorScheme === 'light' ? '#000' : '#fff';
    const lineColor = colorScheme === 'light' ? '#fff' : '#000';

    return (
        <Svg x="0px" y="0px" width="30" height="30" viewBox="0,0,256,256">
            <G transform="translate(-38.4,-38.4) scale(1.3,1.3)">
                <G
                    fillRule="nonzero"
                    strokeWidth="1"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeMiterlimit="10"
                    strokeDashoffset="0"
                    style="mix-blend-mode: normal">
                    <G transform="scale(5.33333,5.33333)">
                        <Path
                            d="M42,37c0,2.762 -2.238,5 -5,5h-26c-2.761,0 -5,-2.238 -5,-5v-26c0,-2.762 2.239,-5 5,-5h26c2.762,0 5,2.238 5,5z"
                            // fill="#3f51b5"
                            fill={bgColor}
                        />
                        <Path
                            d="M34.368,25h-3.368v13h-5v-13h-3v-4h3v-2.41c0.002,-3.508 1.459,-5.59 5.592,-5.59h3.408v4h-2.287c-1.609,0 -1.713,0.6 -1.713,1.723v2.277h4z"
                            fill={lineColor}
                        />
                    </G>
                </G>
            </G>
        </Svg>
    )
}

export const ColorTwitter = () => {
    const colorScheme = useColorScheme();
    const lineColor = colorScheme === 'light' ? '#000' : '#fff';
    return (
        <Svg x="0px" y="0px" width="30" height="30" viewBox="0,0,256,256">
            <G transform="translate(-19.2,-19.2) scale(1.15,1.15)">
                <G
                    fill={lineColor}
                    fillRule="nonzero"
                    strokeWidth="1"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeMiterlimit="10"
                    strokeDashoffset="0"
                    style="mix-blend-mode: normal">
                    <G transform="scale(5.12,5.12)">
                        <Path d="M11,4c-3.866,0 -7,3.134 -7,7v28c0,3.866 3.134,7 7,7h28c3.866,0 7,-3.134 7,-7v-28c0,-3.866 -3.134,-7 -7,-7zM13.08594,13h7.9375l5.63672,8.00977l6.83984,-8.00977h2.5l-8.21094,9.61328l10.125,14.38672h-7.93555l-6.54102,-9.29297l-7.9375,9.29297h-2.5l9.30859,-10.89648zM16.91406,15l14.10742,20h3.06445l-14.10742,-20z" />
                    </G>
                </G>
            </G>
        </Svg>
    )
}