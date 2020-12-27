import { AlertController, Platform } from '@ionic/angular';
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListaCompraService } from '../../services/lista-compra.service';
import { Producto } from '../../interfaces/producto.model';
import { ActionSheetController } from '@ionic/angular';
import { DataLocalService } from 'src/app/services/data-local.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {
  productoD: Producto;
  tabStatus = false
  constructor(
    private activatedRoute: ActivatedRoute,
    private productoService: ListaCompraService,
    private router: Router,
    private alert: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private datalocalService: DataLocalService,
    private socialSharing: SocialSharing,
    private platform: Platform
  ) { }

  ngOnInit() {
    this.tabStatus = JSON.parse(this.activatedRoute.snapshot.params.enFavoritos);
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has("productId")) {
        this.router.navigate(["/tabs/tab1"]);
        return;
      }
      const productId = paramMap.get("productId");
      this.productoD = this.productoService.getProduct(productId);
    }
    )
  }

  onDeleteProduct() {
    this.alert.create({
      header: "¿Estás seguro?",
      message: "¿quieres borrar este producto de la lista de compra?",
      buttons: [
        {
          text: "Cancelar",
          role: "cancelar"
        },
        {
          text: "Borrar",
          handler: () => {
            this.productoService.deleteProduct(this.productoD.id)
            this.router.navigate(["/tabs/tab1"]);
          }
        }]
    }).then(el => {
      el.present();
    })
  }
  async lanzarMenu() {

    let guardarBorrarBtn;
    if (this.tabStatus) {

      guardarBorrarBtn = {
        text: 'Borrar Favorito',
        icon: 'trash',
        cssClass: 'action-dark',
        handler: () => {
          console.log('Borrar de favorito');
          this.datalocalService.borrarProductFavorito(this.productoD);
          this.router.navigate(["/tabs/tab2"]);
        }
      };

    } else {

      guardarBorrarBtn = {
        text: 'Favorito',
        icon: 'star',
        cssClass: 'action-dark',
        handler: () => {
          console.log('Favorito');
          this.datalocalService.guardarFavorito(this.productoD);
        }
      };

    }

    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Compartir',
          icon: 'share',
          cssClass: 'action-dark',
          handler: () => {
            console.log('Share clicked');
            this.compartirNoticia();
          }
        },
        guardarBorrarBtn,
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
          cssClass: 'action-dark',
          handler: () => {
            console.log('Cancel clicked');
          }
        }]
    });

    await actionSheet.present();

  }

  compartirNoticia() {


    if (this.platform.is('cordova')) {
      this.socialSharing.share(
        this.productoD.nombre,
        this.productoD.Ingredientes,
        '',
        this.productoD.foto
      );
    } else {

      if (navigator['share']) {

        navigator['share']({
          title: this.productoD.nombre,
          text: this.productoD.Ingredientes,
          url: this.productoD.foto,
        })
          .then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing', error));
      } else {
        console.log('No se pudo compartir porque no se soporta');
      }

    }




  }
}
