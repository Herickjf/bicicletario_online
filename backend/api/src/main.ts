import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("Bicicletário API")
    .setDescription("Interface de testes da API de Bicicletários")
    .setVersion('1.0')
    .build();

  const theme = new SwaggerTheme();
  const css = theme.getBuffer(SwaggerThemeNameEnum.DARK_MONOKAI);
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customCss: css
  });

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();