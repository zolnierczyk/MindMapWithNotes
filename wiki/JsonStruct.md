# Filozofia struktury #

## Co zawiera? Wszystko! ##

Struktura musi zawierać wszelkie informacje o myślach. Jest pełną reprezentacją danych która potem jest analizowanie w czasie wyświetlania i tylko wybrane informacje są ładowane użytkownikowi na ekran.

## Główny szkielet ##

Wszystkie węzły są zebrane na jednym poziomie i do ich identyfikacji służyć będzie unikatowy klucz. Do stworzenia struktury drzewiastej w każdym węźle służyć będzietablice z kluczami innych węzłów. Odwzorowanie całej drzewiastej struktury po prostu w jsonie jest zbyt ograniczające zwłaszcza że węzły będą mogły odnosić się do ssiebie nawzjame tworząc zapętlenia.

## Grafy i listy ##

Ponieważ główny szkielet nie jest strukturą drzewiastą i na celu nie ma odwzorowania danych w jakikolwiek sposób to dodatkowe funkcje muszą przeistoczyć zbiór danych w coś co można wyświetlić. Podstawą jest sposób wyświetlenia w postacji grafu myśli z chmurkami, przy czym sam graf może przyjmować różne postacie. Dodatkowo dane można wyświetlać tworząc listy z zakupami czy todo.

## Schemat ##

```
#!javascript

{
    nodeList : {
        "id" : {
            title : "Title",
            desc : "Nice notes with syntax",
            dependsOn : {"id"},
            image : {
                link : "url",
                position : "left|right|top|down",
                scale : {x : "1", y: "1"}
            },
            shape : "rect|roundrect|circle|ellips|cloud|star",
            colour : {
                background : "rgb",
                border : "rgb",
                text : "rgb"
            },
            todo : {
                "title" : {
                    startDate : "date",
                    stopDate : "date",
                    priority : "hi|low"
                    dependsOn : "title"
                }
            },
            toBuy : {
                "title" : {
                    price : "inpln",
                    priority : "hi|low",
                }
            }
        }
    }
}
```
