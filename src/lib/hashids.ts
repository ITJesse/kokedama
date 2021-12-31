import Hashids from 'hashids'

export const hashids = new Hashids(process.env.HASHIDS_SALT, 5)
