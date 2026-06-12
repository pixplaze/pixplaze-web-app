const role = {
  USER: {name: 'USER', code: 'RUSR'},
  ADMIN: {name: 'ADMIN', code: 'RADM'},
  SYSTEM: {name: 'SYSTEM', code: 'RSYS'},
  MINECRAFT_PLAYER: {name: 'MINECRAFT_PLAYER', code: 'RMCP'},
  MINECRAFT_OPERATOR: {name: 'MINECRAFT_OPERATOR', code: 'RMCO'},
  MINECRAFT_SERVER: {name: 'MINECRAFT_SERVER', code: 'RMCS'},
  of: (code) => {
    switch (code) {
      case 'RUSR':
      case 'USER':
        return role.USER;
      case 'RADM':
      case 'ADMIN':
        return role.ADMIN;
      case 'RSYS':
      case 'SYSTEM':
        return role.SYSTEM;
      case 'RMCP':
      case 'MINECRAFT_PLAYER':
        return role.MINECRAFT_PLAYER;
      case 'RMCO':
      case 'MINECRAFT_OPERATOR':
        return role.MINECRAFT_OPERATOR;
      case 'RMCS':
      case 'MINECRAFT_SERVER':
        return role.MINECRAFT_SERVER;
      default: throw new Error(`No such role: '${code}'!`);
    }
  }
}

const source = {
  APPLICATION_AUTHORIZED_DEVICE: 'AAD',
  MINECRAFT_AUTHORIZED_DEVICE: 'MAD',
  NOT_AUTHORIZED_DEVICE: 'NAD',
  of: (code) => {
    switch (code) {
      case 'AAD':
      case 'APPLICATION_AUTHORIZED_DEVICE':
        return source.APPLICATION_AUTHORIZED_DEVICE;
      case 'MAD':
      case 'MINECRAFT_AUTHORIZED_DEVICE':
        return source.MINECRAFT_AUTHORIZED_DEVICE;
      case 'NAD':
      case 'NOT_AUTHORIZED_DEVICE':
        return source.NOT_AUTHORIZED_DEVICE;
      default:
        return source.NOT_AUTHORIZED_DEVICE;
    }
}
}

export const parse = (jwt) => {
  return {
    source: jwt.src,
    target: jwt.aud,
    roles: jwt.rls.map(i => role.of(i))
  }
}