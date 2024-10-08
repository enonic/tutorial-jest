Feature: Web page for a Movie Actor

Scenario: Storing information about Léa Seydoux
Given I have a contentType named "person"
And I have a field named "photos" of type "ImageSelector[]"
When I create a new content of type "person"
And I fill in "Léa Seydoux" as the displayName
And I add an image with the filename "Lea-Seydoux.jpg" to "photos"
Then I should be able to get a person using the _name "lea-seydoux"

Scenario: Storing information about Jeffrey Wright
Given I have a contentType named "person"
And I have a field named "photos" of type "ImageSelector[]"
When I create a new content of type "person"
And I fill in "Jeffrey Wright" as the displayName
And I add an image with the filename "Jeffrey-Wright-hp.jpg" to "photos"
Then I should be able to get a person using the _name "jeffrey-wright"

Scenario: Visiting Léa Seydoux page
When I visit the page for the person named "lea-seydoux"
Then the page should have the title "Léa Seydoux"
And the css selector "h1" should have the text "Léa Seydoux"
And the css selector "img" should have the attribute "src" containing "Lea-Seydoux.jpg"

Scenario: Visiting Jeffrey Wright page
  When I visit the page for the person named "jeffrey-wright"
  Then the page should have the title "Jeffrey Wright"
  And the css selector "h1" should have the text "Jeffrey Wright"
  And the css selector "img" should have the attribute "src" containing "Jeffrey-Wright-hp.jpg"
  And the html should be
    """
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>
          Jeffrey Wright
        </title>
        <link
          rel="stylesheet"
          type="text/css"
          href="/admin/site/preview/intro/draft/persons/jeffrey-wright/_/asset/com.example.myproject:0123456789abcdef/styles.css"
        >
      </head>
      <body>
        <h1>
          Jeffrey Wright
        </h1>
        <img src="/admin/site/preview/intro/draft/persons/jeffrey-wright/_/image/00000000-0000-4000-8000-000000000010:0123456789abcdef/width-500/Jeffrey-Wright-hp.jpg">
        <h3>
          This is a sample preview
        </h3>
        Use live integrations with your front-end, or just a mockup - like this  :-)
      </body>
    </html>
    """

Scenario Outline: Visiting a page for a person
  When I visit the page for the person named <sanitizedName>
  Then the page should have the title <name>
  And the css selector "h1" should have the text <name>
  And the css selector "img" should have the attribute "src" containing <filename>

  Examples:
  | sanitizedName | name           | filename              |
  | lea-seydoux   | Léa Seydoux    | Lea-Seydoux.jpg       |
  | jeffrey-wright| Jeffrey Wright | Jeffrey-Wright-hp.jpg |
