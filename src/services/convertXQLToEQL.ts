// import { elasticBuilder } from '../node_modules/xql-v3/index.js'
import { elasticBuilder } from 'xql-v3'

function convertXQLToEQL(initialQuery, defOpt = 'AND') {
    try {
        const result = elasticBuilder(initialQuery, (node) => {
            if (node.val && typeof node.val === 'string' && !node.key.includes('.keyword')) {
                node.val = node.val.toLowerCase()
            }
        }, { defOpt })

        return result
    } catch (err) {
        console.error('error convertXQLToEQL ->', err, err.message)
        throw err
    }
}

export { convertXQLToEQL }