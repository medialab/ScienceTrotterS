import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class DataProvider {
  // TODO : Cache.
  cities: Array<any> = new Array();

  aInterest = [
    {
      'route' : 'route1',
      'clustergroup' : {
        'bg' : '#f99e19'
      },
      'polylineColor' : {
        'color' : '#F99E19'
      },
      'markers' : [
        {
          'title' : "<strong>Gare de Lyon</strong>",
          'lat' : 48.843325,
          'lng' : 2.373486,
          'icon' : {
            'url' : '/assets/imgs/map/marker-orange.svg'
          }
        },
        {
          'title' : "<p style='text-align: center'><strong>Galerie de PalÃ©ontologie et d'Anatomie ComparÃ©e 2</strong><br/><a href='http://www.mnhn.fr/fr/visitez/lieux/galerie-paleontologie-anatomie-comparee/' target='_blank' >Site Web</a></p>",
          'lat' : 48.838748,
          'lng' : 2.346470,
          'icon' : {
            'url' : '/assets/imgs/map/marker-orange.svg'
          }
        },
        {
          'title' : "<strong>HÃ´pital de la PitiÃ© SalpÃªtriÃ¨re</strong>",
          'lat' : 48.837079,
          'lng' : 2.365043,
          'icon' : {
            'url' : '/assets/imgs/map/marker-orange.svg'
          }
        },
        {

          'title' : "<p style='text-align: center'><strong>Grande Galerie de l'Ã‰volution - MNHN</strong><br/><a href='http://www.mnhn.fr/fr/visitez/lieux/grande-galerie-evolution' target='_blank' style='text-decoration: none' >+ d'\info</a></p>",
          'lat' : 48.841894,
          'lng' : 2.356378,
          'icon' : {
            'url' : '/assets/imgs/map/marker-orange.svg'
          }
        },
        {
          'title' : "<strong>Portail de l'ancienne Ã‰cole polytechnique</strong>",
          'lat' : 48.847284,
          'lng' : 2.348650,
          'icon' : {
            'url' : '/assets/imgs/map/marker-orange.svg'
          }
        },
        {
          'title' : "<strong>MusÃ©e Curie</strong>",
          'lat' : 48.844275,
          'lng' : 2.344830,
          'icon' : {
            'url' : '/assets/imgs/map/marker-orange.svg'
          }
        },
        {
          'title' : "<strong>1 Rue de la Cerisaie, 75004 Paris, France</strong>",
          'lat' : 48.851648,
          'lng' : 2.367537,
          'icon' : {
            'url' : '/assets/imgs/map/marker-orange.svg',

          }
        }
      ]
    },
    {
      'route' : 'route2',
      'clustergroup' : {
        'bg' : '#d4332e'
      },
      'polylineColor' : {
        'color' : '#D4332E'
      },
      'markers' : [

        {
          'title' : "<strong>Sainte Chapelle</strong>",
          'lat' : 48.85542,
          'lng' : 2.344987,
          'icon' : {
            'url' : '/assets/imgs/map/marker-rouge.svg'
          }
        },
        {
          'title' : "<strong>OpÃ©ra Garnier</strong>",
          'lat' : 48.871934,
          'lng' : 2.331767,
          'icon' : {
            'url' : '/assets/imgs/map/marker-rouge.svg'
          }
        },
        {
          'title' : "<strong>Galerie Colber</strong>",
          'lat' : 48.866799,
          'lng' : 2.339365,
          'icon' : {
            'url' : '/assets/imgs/map/marker-rouge.svg'
          }
        },
        {
          'title' : "<strong>SacrÃ©-CÅ“ur Basilica</strong>",
          'lat' : 48.886705,
          'lng' : 2.343104,
          'icon' : {
            'url' : '/assets/imgs/map/marker-rouge.svg'
          }
        },
        {
          'title' : "<p style='text-align: center'><strong>The Net Group</strong><br/><a href='http://www.thenetgroup.net/' target='_blank' style='text-decoration: none; color: red' >Site Web</a></p>",
          'lat' : 48.86377,
          'lng' : 2.347921,
          'icon' : {
            'url' : '/assets/imgs/map/marker-rouge.svg'
          }
        }
      ]
    },
    {
      'route' : 'route3',
      'clustergroup' : {
        'bg' : '#3e26b5'
      },
      'polylineColor' : {
        'color' : '#3e26b5'
      },
      'markers' : [

        {
          'title' : "<strong>MusÃ©e d'Orsay</strong>",
          'lat' : 48.859961,
          'lng' : 2.326561,
          'icon' : {
            'url' : '/assets/imgs/map/marker-mauve.svg'
          }
        },
        {
          'title' : "<strong>MusÃ©e de l'Orangerie</strong>",
          'lat' : 48.863788,
          'lng' : 2.322672,
          'icon' : {
            'url' : '/assets/imgs/map/marker-mauve.svg'
          }
        },
        {
          'title' : "<strong>MusÃ©e du quai de Branly</strong>",
          'lat' : 48.860889,
          'lng' : 2.297894,
          'icon' : {
            'url' : '/assets/imgs/map/marker-mauve.svg'
          }
        },
        {
          'title' : "<strong>MusÃ©e du Parfum - Fragonard</strong>",
          'lat' : 48.871499,
          'lng' : 2.330282,
          'icon' : {
            'url' : '/assets/imgs/map/marker-mauve.svg'
          }
        },
        {
          'title' : "<strong>MusÃ©e du Louvre</strong>",
          'lat' : 48.862176,
          'lng' : 2.337018,
          'icon' : {
            'url' : '/assets/imgs/map/marker-mauve.svg'
          }
        }
      ]
    },
    {
      'route' : 'route4',
      'clustergroup' : {
        'bg' : '#841E4F'
      },
      'polylineColor' : {
        'color' : '#841E4F'
      },
      'markers' : [
        {
          'title' : "<strong>CitÃ© des Sciences et de l'Industrie</strong>",
          'lat' : 48.895595,
          'lng' : 2.3879,
          'icon' : {
            'url' : '/assets/imgs/map/marker-violet-fonce.svg'
          }
        },
        {
          'title' : "<strong>Parc de Belleville</strong>",
          'lat' : 48.871068,
          'lng' : 2.384705,
          'icon' : {
            'url' : '/assets/imgs/map/marker-violet-fonce.svg'
          }
        },
        {
          'title' : "<strong>Les Poings d'eau</strong>",
          'lat' : 48.852784,
          'lng' : 2.411025,
          'icon' : {
            'url' : '/assets/imgs/map/marker-violet-fonce.svg'
          }
        },
        {
          'title' : "<p style='text-align: center'><strong>CimetiÃ¨re du PÃ¨re la Chaise</strong><br/><a href='https://pere-lachaise.com/' target='_blank' style='text-decoration: none' >+ d'\info</a></p>",
          'lat' : 48.861393,
          'lng' : 2.393328,
          'icon' : {
            'url' : '/assets/imgs/map/marker-violet-fonce.svg'
          }
        }
      ]
    },
    {
      'route' : 'route5',
      'clustergroup' : {
        'bg' : '#353eed'
      },
      'polylineColor' : {
        'color' : '#353eed'
      },
      'markers' : [
        {
          'title' : "<strong>Champ de Mars - Tour Eiffel</strong>",
          'lat' : 48.855162,
          'lng' : 2.289211,
          'icon' : {
            'url' : '/assets/imgs/map/marker-bleu-fonce.svg'
          }
        },
        {
          'title' : "<strong>Les Invalides</strong>",
          'lat' : 48.859361,
          'lng' : 2.313813,
          'icon' : {
            'url' : '/assets/imgs/map/marker-bleu-fonce.svg'
          }
        },
        {
          'title' : "<strong>Pavillon de Musique</strong>",
          'lat' : 48.851721,
          'lng' : 2.32008,
          'icon' : {
            'url' : '/assets/imgs/map/marker-bleu-fonce.svg'
          }
        },
        {
          'title' : "<strong>Place de Fontenoy</strong>",
          'lat' : 48.850186,
          'lng' : 2.306236,
          'icon' : {
            'url' : '/assets/imgs/map/marker-bleu-fonce.svg'

          }
        },
        {
          'title' : "<strong>Square Saint Lambert</strong>",
          'lat' : 48.842399,
          'lng' : 2.296644,
          'icon' : {
            'url' : '/assets/imgs/map/marker-bleu-fonce.svg'

          }
        },
        {
          'title' : "<strong>Parc Georges-Brassens</strong>",
          'lat' : 48.83163,
          'lng' : 2.300238,
          'icon' : {
            'url' : '/assets/imgs/map/marker-bleu-fonce.svg'

          }
        }
      ]
    }
  ];
}
