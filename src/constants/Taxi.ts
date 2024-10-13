import { BikeSVG, BasicSVG, ConfortSVG, ConfortPlusSVG, VipSVG } from '~/components/svgs/index';

export const taxiCategoriesInfo = [
    {
        slug: 'bike',
        name: 'Bike',
        Icon: BikeSVG,
        pricePerKm: 0.5,
        timePerKm: 0.5,
    },
    {
        slug: 'basic',
        name: 'Basic',
        Icon: BasicSVG,
        pricePerKm: 1,
        timePerKm: 0.45,
    },
    {
        slug: 'confort',
        name: 'Confort',
        Icon: ConfortSVG,
        pricePerKm: 1.5,
        timePerKm: 0.4,
    },
    {
        slug: 'confort_plus',
        name: 'Confort Plus',
        Icon: ConfortPlusSVG,
        pricePerKm: 2,
        timePerKm: 0.42,
    },
    {
        slug: 'vip',
        name: 'Vip',
        Icon: VipSVG,
        pricePerKm: 3,
        timePerKm: 0.38,
    },
]
