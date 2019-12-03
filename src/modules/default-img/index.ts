import { StorefrontApiModule } from 'src/lib/module'
import { StorefrontApiContext } from 'src/lib/module/types'
import img from './api/img'

export const DefaultImgModule: StorefrontApiModule = new StorefrontApiModule({
  key: 'default-img',
  initApi: ({ config, db, app }: StorefrontApiContext): void => {
    app.use('/img', img({ config, db }));
    app.use('/img/:width/:height/:action/:image', (req, res, next) => {
      console.log(req.params)
    });
  }

})
