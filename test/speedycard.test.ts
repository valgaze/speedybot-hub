import { SpeedyCard } from './../src/lib/cards'

test('Kitchen sink SpeedyCard', () => {
  const expected = {
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    type: 'AdaptiveCard',
    version: '1.0',
    body: [
      {
        type: 'TextBlock',
        text: 'Do you want a snack',
        weight: 'Bolder',
        size: 'Large',
        wrap: true,
      },
      {
        type: 'Input.Text',
        placeholder: 'I am a placeholder',
        id: 'inputData',
      },
    ],
    actions: [
      { type: 'Action.Submit', title: 'no', data: { chip_action: 'no' } },
      { type: 'Action.Submit', title: 'Sure', data: { chip_action: 'yes' } },
      { type: 'Action.Submit', title: 'Submit' },
    ],
  }
  const actual = new SpeedyCard()
    .setTitle('Do you want a snack')
    .setChips(['no', { keyword: 'yes', label: 'Sure' }])
    .setInput('I am a placeholder')
    .render()

  expect(actual).toEqual(expected)
})

test('Speedycard detail accepts text input + date input (and text is multiline', () => {
  const expected = {
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    type: 'AdaptiveCard',
    version: '1.0',
    body: [
      {
        type: 'TextBlock',
        text: 'good',
        weight: 'Bolder',
        size: 'Large',
        wrap: true,
      },
      {
        type: 'TextBlock',
        text: 'If you see this card, everything is working',
        size: 'Medium',
        isSubtle: true,
        wrap: true,
        weight: 'Lighter',
      },
      {
        type: 'FactSet',
        facts: [
          {
            title: "Bot's Date",
            value: 'fixed',
          },
        ],
      },
      {
        type: 'Image',
        url: 'https://raw.githubusercontent.com/valgaze/speedybot/master/docs/assets/chocolate_chip_cookies.png',
        horizontalAlignment: 'Center',
        size: 'Large',
      },
      {
        type: 'Input.ChoiceSet',
        id: 'choiceSelect',
        value: '0',
        isMultiSelect: false,
        isVisible: true,
        choices: [
          {
            title: 'option a',
            value: 'option a',
          },
          {
            title: 'option b',
            value: 'option b',
          },
          {
            title: 'option c',
            value: 'option c',
          },
        ],
      },
      {
        type: 'Input.Text',
        placeholder: "What's on your mind?",
        id: 'inputData',
      },
    ],
    backgroundImage:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAMbWlDQ1BJQ0MgUHJvZmlsZQAASImVVwdYU8kWnluSkJDQAghICb0jUgNICaEFkF4EGyEJJJQYE4KKvSwquHYRxYquiii2lWYBsSuLYu+LBRVlXdTFhsqbkICu+8r3zvfNvX/OnPlPuTO59wCg+YErkeShWgDkiwukCeHBjDFp6QzSU4AAIiADZ+DF5ckkrLi4aABl8P53eXcDWkO56qzg+uf8fxUdvkDGAwAZB3EmX8bLh7gZAHwDTyItAICo0FtOKZAo8ByIdaUwQIhXK3C2Eu9S4EwlPjpgk5TAhvgyAGpULleaDYDGPahnFPKyIY/GZ4hdxXyRGABNJ4gDeEIuH2JF7E75+ZMUuBxiO2gvgRjGA5iZ33Fm/40/c4ify80ewsq8BkQtRCST5HGn/Z+l+d+Snycf9GEDB1UojUhQ5A9reCt3UpQCUyHuFmfGxCpqDfEHEV9ZdwBQilAekay0R415MjasH9CH2JXPDYmC2BjiMHFeTLRKn5klCuNADHcLOlVUwEmC2ADiRQJZaKLKZot0UoLKF1qbJWWzVPpzXOmAX4WvB/LcZJaK/41QwFHxYxpFwqRUiCkQWxWKUmIg1oDYRZabGKWyGVUkZMcM2kjlCYr4rSBOEIjDg5X8WGGWNCxBZV+SLxvMF9siFHFiVPhggTApQlkf7BSPOxA/zAW7LBCzkgd5BLIx0YO58AUhocrcsecCcXKiiueDpCA4QbkWp0jy4lT2uIUgL1yht4DYQ1aYqFqLpxTAzankx7MkBXFJyjjxohxuZJwyHnw5iAZsEAIYQA5HJpgEcoCorbuuG/5SzoQBLpCCbCCAJ1SpGVyROjAjhtdEUAT+gEgAZEPrggdmBaAQ6r8MaZVXZ5A1MFs4sCIXPIU4H0SBPPhbPrBKPOQtBTyBGtE/vHPh4MF48+BQzP97/aD2m4YFNdEqjXzQI0Nz0JIYSgwhRhDDiPa4ER6A++HR8BoEhxvOxH0G8/hmT3hKaCc8IlwndBBuTxTNk/4Q5WjQAfnDVLXI/L4WuA3k9MSDcX/IDplxfdwIOOMe0A8LD4SePaGWrYpbURXGD9x/y+C7p6GyI7uSUfIwchDZ7seVGg4ankMsilp/Xx9lrJlD9WYPzfzon/1d9fnwHvWjJbYIO4SdxU5g57GjWB1gYE1YPdaKHVPgod31ZGB3DXpLGIgnF/KI/uGPq/KpqKTMtdq1y/Wzcq5AMLVAcfDYkyTTpKJsYQGDBd8OAgZHzHNxYri5urkBoHjXKP++3sYPvEMQ/dZvuvm/A+Df1N/ff+SbLrIJgAPe8Pg3fNPZMQHQVgfgXANPLi1U6nDFhQD/JTThSTMEpsAS2MF83IAX8ANBIBREgliQBNLABFhlIdznUjAFzABzQTEoBcvBGrAebAbbwC6wFxwEdeAoOAHOgIvgMrgO7sLd0wlegh7wDvQhCEJCaAgdMUTMEGvEEXFDmEgAEopEIwlIGpKBZCNiRI7MQOYjpchKZD2yFalCDiANyAnkPNKO3EYeIl3IG+QTiqFUVBc1QW3QESgTZaFRaBI6Hs1GJ6NF6AJ0KVqOVqJ70Fr0BHoRvY52oC/RXgxg6pg+Zo45Y0yMjcVi6VgWJsVmYSVYGVaJ1WCN8DlfxTqwbuwjTsTpOAN3hjs4Ak/GefhkfBa+BF+P78Jr8VP4Vfwh3oN/JdAIxgRHgi+BQxhDyCZMIRQTygg7CIcJp+FZ6iS8IxKJ+kRbojc8i2nEHOJ04hLiRuI+YjOxnfiY2EsikQxJjiR/UiyJSyogFZPWkfaQmkhXSJ2kD2rqamZqbmphaulqYrV5amVqu9WOq11Re6bWR9YiW5N9ybFkPnkaeRl5O7mRfIncSe6jaFNsKf6UJEoOZS6lnFJDOU25R3mrrq5uoe6jHq8uUp+jXq6+X/2c+kP1j1QdqgOVTR1HlVOXUndSm6m3qW9pNJoNLYiWTiugLaVV0U7SHtA+aNA1XDQ4GnyN2RoVGrUaVzReaZI1rTVZmhM0izTLNA9pXtLs1iJr2Wixtbhas7QqtBq0bmr1atO1R2rHaudrL9HerX1e+7kOScdGJ1SHr7NAZ5vOSZ3HdIxuSWfTefT59O300/ROXaKurS5HN0e3VHevbptuj56Onodeit5UvQq9Y3od+pi+jT5HP09/mf5B/Rv6n4aZDGMNEwxbPKxm2JVh7w2GGwQZCAxKDPYZXDf4ZMgwDDXMNVxhWGd43wg3cjCKN5pitMnotFH3cN3hfsN5w0uGHxx+xxg1djBOMJ5uvM241bjXxNQk3ERiss7kpEm3qb5pkGmO6WrT46ZdZnSzADOR2WqzJrMXDD0Gi5HHKGecYvSYG5tHmMvNt5q3mfdZ2FokW8yz2Gdx35JiybTMslxt2WLZY2VmNdpqhlW11R1rsjXTWmi91vqs9XsbW5tUm4U2dTbPbQ1sObZFttW29+xodoF2k+0q7a7ZE+2Z9rn2G+0vO6AOng5ChwqHS46oo5ejyHGjY7sTwcnHSexU6XTTmerMci50rnZ+6KLvEu0yz6XO5dUIqxHpI1aMODviq6una57rdte7I3VGRo6cN7Jx5Bs3BzeeW4XbNXeae5j7bPd699cejh4Cj00etzzpnqM9F3q2eH7x8vaSetV4dXlbeWd4b/C+ydRlxjGXMM/5EHyCfWb7HPX56OvlW+B70PdPP2e/XL/dfs9H2Y4SjNo+6rG/hT/Xf6t/RwAjICNgS0BHoHkgN7Ay8FGQZRA/aEfQM5Y9K4e1h/Uq2DVYGnw4+D3blz2T3RyChYSHlIS0heqEJoeuD30QZhGWHVYd1hPuGT49vDmCEBEVsSLiJseEw+NUcXoivSNnRp6KokYlRq2PehTtEC2NbhyNjo4cvWr0vRjrGHFMXSyI5cSuir0fZxs3Oe5IPDE+Lr4i/mnCyIQZCWcT6YkTE3cnvksKTlqWdDfZLlme3JKimTIupSrlfWpI6srUjjEjxswcczHNKE2UVp9OSk9J35HeOzZ07JqxneM8xxWPuzHedvzU8ecnGE3Im3BsouZE7sRDGYSM1IzdGZ+5sdxKbm8mJ3NDZg+PzVvLe8kP4q/mdwn8BSsFz7L8s1ZmPc/2z16V3SUMFJYJu0Vs0XrR65yInM0573Njc3fm9uel5u3LV8vPyG8Q64hzxacmmU6aOqld4igplnRM9p28ZnKPNEq6Q4bIxsvqC3ThR32r3E7+k/xhYUBhReGHKSlTDk3Vniqe2jrNYdriac+Kwop+mY5P501vmWE+Y+6MhzNZM7fOQmZlzmqZbTl7wezOOeFzds2lzM2d+9s813kr5/01P3V+4wKTBXMWPP4p/KfqYo1iafHNhX4LNy/CF4kWtS12X7xu8dcSfsmFUtfSstLPS3hLLvw88ufyn/uXZi1tW+a1bNNy4nLx8hsrAlfsWqm9smjl41WjV9WuZqwuWf3Xmolrzpd5lG1eS1krX9tRHl1ev85q3fJ1n9cL11+vCK7Yt8F4w+IN7zfyN17ZFLSpZrPJ5tLNn7aIttzaGr61ttKmsmwbcVvhtqfbU7af/YX5S9UOox2lO77sFO/s2JWw61SVd1XVbuPdy6rRanl1155xey7vDdlbX+Ncs3Wf/r7S/WC/fP+LAxkHbhyMOthyiHmo5lfrXzccph8uqUVqp9X21AnrOurT6tsbIhtaGv0aDx9xObLzqPnRimN6x5YdpxxfcLy/qaipt1nS3H0i+8Tjloktd0+OOXntVPypttNRp8+dCTtz8izrbNM5/3NHz/ueb7jAvFB30etibatn6+HfPH873ObVVnvJ+1L9ZZ/Lje2j2o9fCbxy4mrI1TPXONcuXo+53n4j+catm+Nudtzi33p+O+/26zuFd/ruzrlHuFdyX+t+2QPjB5W/2/++r8Or49jDkIetjxIf3X3Me/zyiezJ584FT2lPy56ZPat67vb8aFdY1+UXY190vpS87Osu/kP7jw2v7F79+mfQn609Y3o6X0tf979Z8tbw7c6/PP5q6Y3rffAu/13f+5IPhh92fWR+PPsp9dOzvimfSZ/Lv9h/afwa9fVef35/v4Qr5Q58CmBwoFlZALzZCQAtDQA67NsoY5W94IAgyv51AIH/hJX94oB4AVADv9/ju+HXzU0A9m+H7Rfk14S9ahwNgCQfgLq7Dw2VyLLc3ZRcVNinEB7097+FPRtpFQBflvf391X293/ZBoOFvWOzWNmDKoQIe4YtnC+Z+Zng34iyP/0uxx/vQBGBB/jx/i/zoZDc6xYYDgAAAIplWElmTU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAACQAAAAAQAAAJAAAAABAAOShgAHAAAAEgAAAHigAgAEAAAAAQAAACagAwAEAAAAAQAAACYAAAAAQVNDSUkAAABTY3JlZW5zaG90YWJUtQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAdRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDYuMC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+Mzg8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+Mzg8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpVc2VyQ29tbWVudD5TY3JlZW5zaG90PC9leGlmOlVzZXJDb21tZW50PgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4K2WZ6jwAAABxpRE9UAAAAAgAAAAAAAAATAAAAKAAAABMAAAATAAADk4/gdzcAAANfSURBVFgJbJYNepxADEOBs2YP0eaCbQ8FfU+2gSU732YYbEnW/ABZX3+/j2Xh99bW5TiOZV0raHaj27d1IRP4cTBeiwdy2dYdzp3AeCcPxnxnSpDYCrbYZmpUSXvwr7+/ZS5HirQA2APRDWeH7jD5bJKS/5kCanDjb+evLKW3zltYnPr8HvXX1x+MkdNSHKZ/GDQnf1ap9eK5a3coRcbTiomaU2nbj1GvWcvRetZ3xbLUOo6KpopUVeL6LWdcveq6FgF5O1ta/CrtjO4GVd6tOOckMmAe9bOVnqdsC5JZfi+OFSV31AHr5SZj3nlw2eiz5LHDOYuG/CjUfSasc4j+wlXfmJef9THG4RdgcYxk9SLUyikhf1YxWlBQbA4jThN8mmN16HKe+uh4e7YaphIxsB/qr1+csayAXQxJizzXUTPXGuA2cJORUk/nhQGZ1pRwPdxO7syg427s7orhR31W7JfSVfdUki46VfHLUndII59a0MOfK0Dj17PJPblsd5ZSpQKnv/M8/E9RA8ZslYORGSFz5pIZ3UGGE4xFaFUL7MFm+x7s+C3ZNYiMpDW+YqwjfSmSZhylG05SRu6rkKDdvWiCIOPETby2f+yKr4mq2PVaY339YyvN2k6gQ9/mnoGyVni3lOeQ/QzFXFNLoHrPnA+HnLf3advzrZ+E50LjH+pz+L85/CYfKnLg+1ZSfOYrzJayANbdd1dOTSXoxZyGQ0ik8hle928v7dss6pPkrMXyl9lStgJq9dhZZei1jGQ7M3uIriKAfowkloScW7NMJurABVE0ugy5nfr5JK28j458xMxY415A8qcaqs1JAxPjw6tbv7e+4TW7e40Ud9lC7iMB5lP9+iSVaR3bJNTWyaxca5ZDYmrzkIGjkCvIfV66fJI0maJhCwY4mJI8F0mI2gmnSNU/P+ICVHM2ztAFDwHBFGR1NjOZbX+IVGsxlWNOmQlnEBUibYDb+OT+kX6rX2csNIF1TnJ76vUglwuhaJ5YBk7Ft3g/JaUm3lb75aB+xDNRP2e2wTG81Bnn/7EgCtRHJQQ5Gph+VLIydkpxSW0NOr5IYRabJzf2M4V4Edaf2hNnYuq3sfGqDcljQY6r6CbW2alknSGONKY0N67EywarW+NWS5vxmIu1zv+s/x8AAP//YTDCxwAAAzJJREFUdZYLYtswDEMj3zW7w7oLLj2UPTwQlBQ3Y9JI/AEUxbgZz9fv6/EYjynSrA5trs2egHaj7nu0S4m87NmcAx9Yh3Zn2MC3bIHoUcfz9ZWI94CiORR5vhOGF4xVexnb9Y7ksh6FpNooUsXXIUINmCx7g1zYJdsYBJ85ccXJJFuXyBpYn15Jxs1awd2OEOETCL4K1lo7LC2f+LeOdRgrFdFzzklBWKrAAsweByEt0vt4zqxEQeAoLMCGWk3H/i8aiOfrj0KruSfJAjmwUJv+Dn1cLlIKb3x1REOzxchs6SgWhWVdh8GH3eHxrln4yT+e31/FQ5oJnVUfKQBlAs7NFucAlQZER85cEiS+0lt5uKoXPtjOv64yQD3Qze8VQm5Wq96ZxOoShay+pAix1dVTkYR8uRobjJJmkXbjX4URbdygZCQMAChmYvrQZpOiR0A5+jpZI2yM2Yassl2q8tCrOiz7jAVPGP0cY0a4U3c8+cP6ViEkYTVO68yh2yHAtNUNkN8HchwKnGIySbgIlOPOXx0j0BOfirRUeOmQAma82bEV2zsX24rXZandTW+SD/wurP1gVSrXwZQsqfnY4ZMl0DHqIUx0GpBLIr5s7pz2ZZFNGzCRj/xcJe31qBAkBK4QKZB6DPjZI/MEjr+OQHRY2ErQ6iuwtbhOZ/8qR1f6gX/8+tZzTIXwMq2X7F1F9uBTlrpDN3m7frnXHCWmiyQ/6Y+TnMliO107kjw9jtdx+wEL5JL6IpCDEMsInmqrL1h7D3Hugq4dXCdMiBO0P7VxMT5K+fiUzTNrCzkk7KJ4/xOHyCQBUOwlUE7D1VZr9kSg4r9jOgwj3+Z1jdDDf72ZiQNf7xv/eP7Vrwv5qhcEQnkrUDrNmF0KnmsOd0wm6ZryH87khTqjlq2x4KDC5qdjLoSKPTQUtYJ8Io67+SrZGPqQ2F+HOzODxQem0NQlpwf5hLHnROmf+OtxoUBfmxnUAoj4AFS+qwYs7ZYnhUDev69SlknIRioMHCL1RyJv6jU+Ntw/+Wv4ScxPCldvoCDDIFldNJbAhJgc7TRNwnCcPvBJZ54yOqhTamsm2VzZxGr+f1OdHzAEGGqzAAAAAElFTkSuQmCC',
    actions: [
      {
        type: 'Action.Submit',
        title: 'Submit',
        data: {
          mySpecialData: {
            a: 1,
            b: 2,
          },
        },
      },
      {
        type: 'Action.OpenUrl',
        title: 'Take a moment to celebrate',
        url: 'https://www.youtube.com/watch?v=3GwjfUFyY6M',
      },
      {
        type: 'Action.ShowCard',
        title: 'Details',
        card: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.0',
          body: [
            {
              type: 'TextBlock',
              text: 'What is on your mind?',
              weight: 'Bolder',
              size: 'Large',
              wrap: true,
            },
            {
              type: 'Input.Text',
              id: 'comment',
              isMultiline: true,
              placeholder: 'Enter your comment',
            },
            {
              type: 'Input.Date',
              id: 'dueDate',
            },
          ],
          actions: [
            {
              type: 'Action.Submit',
              title: 'Submit',
            },
          ],
        },
      },
    ],
  }

  const cardData = new SpeedyCard()
    .card({
      title: 'good',
      subTitle: 'If you see this card, everything is working',
      image:
        'https://raw.githubusercontent.com/valgaze/speedybot/master/docs/assets/chocolate_chip_cookies.png',
      url: 'https://www.youtube.com/watch?v=3GwjfUFyY6M',
      urlLabel: 'Take a moment to celebrate',
      table: [[`Bot's Date`, 'fixed']],
    })

    .setInput(`What's on your mind?`)
    .setData({ mySpecialData: { a: 1, b: 2 } })
    .setChoices(['option a', 'option b', 'option c'])
    .setBackgroundImage(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAMbWlDQ1BJQ0MgUHJvZmlsZQAASImVVwdYU8kWnluSkJDQAghICb0jUgNICaEFkF4EGyEJJJQYE4KKvSwquHYRxYquiii2lWYBsSuLYu+LBRVlXdTFhsqbkICu+8r3zvfNvX/OnPlPuTO59wCg+YErkeShWgDkiwukCeHBjDFp6QzSU4AAIiADZ+DF5ckkrLi4aABl8P53eXcDWkO56qzg+uf8fxUdvkDGAwAZB3EmX8bLh7gZAHwDTyItAICo0FtOKZAo8ByIdaUwQIhXK3C2Eu9S4EwlPjpgk5TAhvgyAGpULleaDYDGPahnFPKyIY/GZ4hdxXyRGABNJ4gDeEIuH2JF7E75+ZMUuBxiO2gvgRjGA5iZ33Fm/40/c4ify80ewsq8BkQtRCST5HGn/Z+l+d+Snycf9GEDB1UojUhQ5A9reCt3UpQCUyHuFmfGxCpqDfEHEV9ZdwBQilAekay0R415MjasH9CH2JXPDYmC2BjiMHFeTLRKn5klCuNADHcLOlVUwEmC2ADiRQJZaKLKZot0UoLKF1qbJWWzVPpzXOmAX4WvB/LcZJaK/41QwFHxYxpFwqRUiCkQWxWKUmIg1oDYRZabGKWyGVUkZMcM2kjlCYr4rSBOEIjDg5X8WGGWNCxBZV+SLxvMF9siFHFiVPhggTApQlkf7BSPOxA/zAW7LBCzkgd5BLIx0YO58AUhocrcsecCcXKiiueDpCA4QbkWp0jy4lT2uIUgL1yht4DYQ1aYqFqLpxTAzankx7MkBXFJyjjxohxuZJwyHnw5iAZsEAIYQA5HJpgEcoCorbuuG/5SzoQBLpCCbCCAJ1SpGVyROjAjhtdEUAT+gEgAZEPrggdmBaAQ6r8MaZVXZ5A1MFs4sCIXPIU4H0SBPPhbPrBKPOQtBTyBGtE/vHPh4MF48+BQzP97/aD2m4YFNdEqjXzQI0Nz0JIYSgwhRhDDiPa4ER6A++HR8BoEhxvOxH0G8/hmT3hKaCc8IlwndBBuTxTNk/4Q5WjQAfnDVLXI/L4WuA3k9MSDcX/IDplxfdwIOOMe0A8LD4SePaGWrYpbURXGD9x/y+C7p6GyI7uSUfIwchDZ7seVGg4ankMsilp/Xx9lrJlD9WYPzfzon/1d9fnwHvWjJbYIO4SdxU5g57GjWB1gYE1YPdaKHVPgod31ZGB3DXpLGIgnF/KI/uGPq/KpqKTMtdq1y/Wzcq5AMLVAcfDYkyTTpKJsYQGDBd8OAgZHzHNxYri5urkBoHjXKP++3sYPvEMQ/dZvuvm/A+Df1N/ff+SbLrIJgAPe8Pg3fNPZMQHQVgfgXANPLi1U6nDFhQD/JTThSTMEpsAS2MF83IAX8ANBIBREgliQBNLABFhlIdznUjAFzABzQTEoBcvBGrAebAbbwC6wFxwEdeAoOAHOgIvgMrgO7sLd0wlegh7wDvQhCEJCaAgdMUTMEGvEEXFDmEgAEopEIwlIGpKBZCNiRI7MQOYjpchKZD2yFalCDiANyAnkPNKO3EYeIl3IG+QTiqFUVBc1QW3QESgTZaFRaBI6Hs1GJ6NF6AJ0KVqOVqJ70Fr0BHoRvY52oC/RXgxg6pg+Zo45Y0yMjcVi6VgWJsVmYSVYGVaJ1WCN8DlfxTqwbuwjTsTpOAN3hjs4Ak/GefhkfBa+BF+P78Jr8VP4Vfwh3oN/JdAIxgRHgi+BQxhDyCZMIRQTygg7CIcJp+FZ6iS8IxKJ+kRbojc8i2nEHOJ04hLiRuI+YjOxnfiY2EsikQxJjiR/UiyJSyogFZPWkfaQmkhXSJ2kD2rqamZqbmphaulqYrV5amVqu9WOq11Re6bWR9YiW5N9ybFkPnkaeRl5O7mRfIncSe6jaFNsKf6UJEoOZS6lnFJDOU25R3mrrq5uoe6jHq8uUp+jXq6+X/2c+kP1j1QdqgOVTR1HlVOXUndSm6m3qW9pNJoNLYiWTiugLaVV0U7SHtA+aNA1XDQ4GnyN2RoVGrUaVzReaZI1rTVZmhM0izTLNA9pXtLs1iJr2Wixtbhas7QqtBq0bmr1atO1R2rHaudrL9HerX1e+7kOScdGJ1SHr7NAZ5vOSZ3HdIxuSWfTefT59O300/ROXaKurS5HN0e3VHevbptuj56Onodeit5UvQq9Y3od+pi+jT5HP09/mf5B/Rv6n4aZDGMNEwxbPKxm2JVh7w2GGwQZCAxKDPYZXDf4ZMgwDDXMNVxhWGd43wg3cjCKN5pitMnotFH3cN3hfsN5w0uGHxx+xxg1djBOMJ5uvM241bjXxNQk3ERiss7kpEm3qb5pkGmO6WrT46ZdZnSzADOR2WqzJrMXDD0Gi5HHKGecYvSYG5tHmMvNt5q3mfdZ2FokW8yz2Gdx35JiybTMslxt2WLZY2VmNdpqhlW11R1rsjXTWmi91vqs9XsbW5tUm4U2dTbPbQ1sObZFttW29+xodoF2k+0q7a7ZE+2Z9rn2G+0vO6AOng5ChwqHS46oo5ejyHGjY7sTwcnHSexU6XTTmerMci50rnZ+6KLvEu0yz6XO5dUIqxHpI1aMODviq6una57rdte7I3VGRo6cN7Jx5Bs3BzeeW4XbNXeae5j7bPd699cejh4Cj00etzzpnqM9F3q2eH7x8vaSetV4dXlbeWd4b/C+ydRlxjGXMM/5EHyCfWb7HPX56OvlW+B70PdPP2e/XL/dfs9H2Y4SjNo+6rG/hT/Xf6t/RwAjICNgS0BHoHkgN7Ay8FGQZRA/aEfQM5Y9K4e1h/Uq2DVYGnw4+D3blz2T3RyChYSHlIS0heqEJoeuD30QZhGWHVYd1hPuGT49vDmCEBEVsSLiJseEw+NUcXoivSNnRp6KokYlRq2PehTtEC2NbhyNjo4cvWr0vRjrGHFMXSyI5cSuir0fZxs3Oe5IPDE+Lr4i/mnCyIQZCWcT6YkTE3cnvksKTlqWdDfZLlme3JKimTIupSrlfWpI6srUjjEjxswcczHNKE2UVp9OSk9J35HeOzZ07JqxneM8xxWPuzHedvzU8ecnGE3Im3BsouZE7sRDGYSM1IzdGZ+5sdxKbm8mJ3NDZg+PzVvLe8kP4q/mdwn8BSsFz7L8s1ZmPc/2z16V3SUMFJYJu0Vs0XrR65yInM0573Njc3fm9uel5u3LV8vPyG8Q64hzxacmmU6aOqld4igplnRM9p28ZnKPNEq6Q4bIxsvqC3ThR32r3E7+k/xhYUBhReGHKSlTDk3Vniqe2jrNYdriac+Kwop+mY5P501vmWE+Y+6MhzNZM7fOQmZlzmqZbTl7wezOOeFzds2lzM2d+9s813kr5/01P3V+4wKTBXMWPP4p/KfqYo1iafHNhX4LNy/CF4kWtS12X7xu8dcSfsmFUtfSstLPS3hLLvw88ufyn/uXZi1tW+a1bNNy4nLx8hsrAlfsWqm9smjl41WjV9WuZqwuWf3Xmolrzpd5lG1eS1krX9tRHl1ev85q3fJ1n9cL11+vCK7Yt8F4w+IN7zfyN17ZFLSpZrPJ5tLNn7aIttzaGr61ttKmsmwbcVvhtqfbU7af/YX5S9UOox2lO77sFO/s2JWw61SVd1XVbuPdy6rRanl1155xey7vDdlbX+Ncs3Wf/r7S/WC/fP+LAxkHbhyMOthyiHmo5lfrXzccph8uqUVqp9X21AnrOurT6tsbIhtaGv0aDx9xObLzqPnRimN6x5YdpxxfcLy/qaipt1nS3H0i+8Tjloktd0+OOXntVPypttNRp8+dCTtz8izrbNM5/3NHz/ueb7jAvFB30etibatn6+HfPH873ObVVnvJ+1L9ZZ/Lje2j2o9fCbxy4mrI1TPXONcuXo+53n4j+catm+Nudtzi33p+O+/26zuFd/ruzrlHuFdyX+t+2QPjB5W/2/++r8Or49jDkIetjxIf3X3Me/zyiezJ584FT2lPy56ZPat67vb8aFdY1+UXY190vpS87Osu/kP7jw2v7F79+mfQn609Y3o6X0tf979Z8tbw7c6/PP5q6Y3rffAu/13f+5IPhh92fWR+PPsp9dOzvimfSZ/Lv9h/afwa9fVef35/v4Qr5Q58CmBwoFlZALzZCQAtDQA67NsoY5W94IAgyv51AIH/hJX94oB4AVADv9/ju+HXzU0A9m+H7Rfk14S9ahwNgCQfgLq7Dw2VyLLc3ZRcVNinEB7097+FPRtpFQBflvf391X293/ZBoOFvWOzWNmDKoQIe4YtnC+Z+Zng34iyP/0uxx/vQBGBB/jx/i/zoZDc6xYYDgAAAIplWElmTU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAACQAAAAAQAAAJAAAAABAAOShgAHAAAAEgAAAHigAgAEAAAAAQAAACagAwAEAAAAAQAAACYAAAAAQVNDSUkAAABTY3JlZW5zaG90YWJUtQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAdRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDYuMC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+Mzg8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+Mzg8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpVc2VyQ29tbWVudD5TY3JlZW5zaG90PC9leGlmOlVzZXJDb21tZW50PgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4K2WZ6jwAAABxpRE9UAAAAAgAAAAAAAAATAAAAKAAAABMAAAATAAADk4/gdzcAAANfSURBVFgJbJYNepxADEOBs2YP0eaCbQ8FfU+2gSU732YYbEnW/ABZX3+/j2Xh99bW5TiOZV0raHaj27d1IRP4cTBeiwdy2dYdzp3AeCcPxnxnSpDYCrbYZmpUSXvwr7+/ZS5HirQA2APRDWeH7jD5bJKS/5kCanDjb+evLKW3zltYnPr8HvXX1x+MkdNSHKZ/GDQnf1ap9eK5a3coRcbTiomaU2nbj1GvWcvRetZ3xbLUOo6KpopUVeL6LWdcveq6FgF5O1ta/CrtjO4GVd6tOOckMmAe9bOVnqdsC5JZfi+OFSV31AHr5SZj3nlw2eiz5LHDOYuG/CjUfSasc4j+wlXfmJef9THG4RdgcYxk9SLUyikhf1YxWlBQbA4jThN8mmN16HKe+uh4e7YaphIxsB/qr1+csayAXQxJizzXUTPXGuA2cJORUk/nhQGZ1pRwPdxO7syg427s7orhR31W7JfSVfdUki46VfHLUndII59a0MOfK0Dj17PJPblsd5ZSpQKnv/M8/E9RA8ZslYORGSFz5pIZ3UGGE4xFaFUL7MFm+x7s+C3ZNYiMpDW+YqwjfSmSZhylG05SRu6rkKDdvWiCIOPETby2f+yKr4mq2PVaY339YyvN2k6gQ9/mnoGyVni3lOeQ/QzFXFNLoHrPnA+HnLf3advzrZ+E50LjH+pz+L85/CYfKnLg+1ZSfOYrzJayANbdd1dOTSXoxZyGQ0ik8hle928v7dss6pPkrMXyl9lStgJq9dhZZei1jGQ7M3uIriKAfowkloScW7NMJurABVE0ugy5nfr5JK28j458xMxY415A8qcaqs1JAxPjw6tbv7e+4TW7e40Ud9lC7iMB5lP9+iSVaR3bJNTWyaxca5ZDYmrzkIGjkCvIfV66fJI0maJhCwY4mJI8F0mI2gmnSNU/P+ICVHM2ztAFDwHBFGR1NjOZbX+IVGsxlWNOmQlnEBUibYDb+OT+kX6rX2csNIF1TnJ76vUglwuhaJ5YBk7Ft3g/JaUm3lb75aB+xDNRP2e2wTG81Bnn/7EgCtRHJQQ5Gph+VLIydkpxSW0NOr5IYRabJzf2M4V4Edaf2hNnYuq3sfGqDcljQY6r6CbW2alknSGONKY0N67EywarW+NWS5vxmIu1zv+s/x8AAP//YTDCxwAAAzJJREFUdZYLYtswDEMj3zW7w7oLLj2UPTwQlBQ3Y9JI/AEUxbgZz9fv6/EYjynSrA5trs2egHaj7nu0S4m87NmcAx9Yh3Zn2MC3bIHoUcfz9ZWI94CiORR5vhOGF4xVexnb9Y7ksh6FpNooUsXXIUINmCx7g1zYJdsYBJ85ccXJJFuXyBpYn15Jxs1awd2OEOETCL4K1lo7LC2f+LeOdRgrFdFzzklBWKrAAsweByEt0vt4zqxEQeAoLMCGWk3H/i8aiOfrj0KruSfJAjmwUJv+Dn1cLlIKb3x1REOzxchs6SgWhWVdh8GH3eHxrln4yT+e31/FQ5oJnVUfKQBlAs7NFucAlQZER85cEiS+0lt5uKoXPtjOv64yQD3Qze8VQm5Wq96ZxOoShay+pAix1dVTkYR8uRobjJJmkXbjX4URbdygZCQMAChmYvrQZpOiR0A5+jpZI2yM2Yassl2q8tCrOiz7jAVPGP0cY0a4U3c8+cP6ViEkYTVO68yh2yHAtNUNkN8HchwKnGIySbgIlOPOXx0j0BOfirRUeOmQAma82bEV2zsX24rXZandTW+SD/wurP1gVSrXwZQsqfnY4ZMl0DHqIUx0GpBLIr5s7pz2ZZFNGzCRj/xcJe31qBAkBK4QKZB6DPjZI/MEjr+OQHRY2ErQ6iuwtbhOZ/8qR1f6gX/8+tZzTIXwMq2X7F1F9uBTlrpDN3m7frnXHCWmiyQ/6Y+TnMliO107kjw9jtdx+wEL5JL6IpCDEMsInmqrL1h7D3Hugq4dXCdMiBO0P7VxMT5K+fiUzTNrCzkk7KJ4/xOHyCQBUOwlUE7D1VZr9kSg4r9jOgwj3+Z1jdDDf72ZiQNf7xv/eP7Vrwv5qhcEQnkrUDrNmF0KnmsOd0wm6ZryH87khTqjlq2x4KDC5qdjLoSKPTQUtYJ8Io67+SrZGPqQ2F+HOzODxQem0NQlpwf5hLHnROmf+OtxoUBfmxnUAoj4AFS+qwYs7ZYnhUDev69SlknIRioMHCL1RyJv6jU+Ntw/+Wv4ScxPCldvoCDDIFldNJbAhJgc7TRNwnCcPvBJZ54yOqhTamsm2VzZxGr+f1OdHzAEGGqzAAAAAElFTkSuQmCC'
    )
    .setDetail(
      new SpeedyCard()
        .card({
          title: 'What is on your mind?',
        })
        .setInput('Enter your comment', {
          id: 'comment',
          isMultiline: true,
        })
        .setDate('dueDate')
    )
    .render()

  expect(cardData).toEqual(expected)
})
