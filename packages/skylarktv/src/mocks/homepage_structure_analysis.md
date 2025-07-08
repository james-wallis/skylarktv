# SkylarkTV Homepage Structure Analysis

## Homepage Set Details

**ID:** `rec77VA8k5UUiduSc`  
**External ID:** `streamtv_homepage`  
**Title:** SkylarkTV Homepage  
**Set Type:** PAGE  
**Creation Order:** 100  

## Content Items (16 total)

The homepage contains 16 content items, which are a mix of SkylarkSet objects and individual content items:

### SkylarkSet Items:

1. **Home page hero** (`rec9VWduIzVdyWwTh`)
   - External ID: `streamtv_home_page_slider`
   - Type: Hero/slider content at the top of the homepage

2. **Kids Home page hero** (`recUNO0rFV0g3XILg`)
   - External ID: `streamtv_home_page_slider_kids`
   - Type: Kids-specific hero content

3. **This Weeks Trending Movies** (`rech6CENKB3x54FLa`)
   - External ID: `streamtv_trending_movies`
   - Type: Rail of trending movie content

4. **Top Arabic Movies** (`rectmhBvJiImZQLux`)
   - External ID: `streamtv_top_arabic_movies`
   - Type: Rail of Arabic movie content

5. **New TV Releases** (`recE7BO7nzSy0dDoe`)
   - External ID: `streamtv_new_tv_releases`
   - Type: Rail of new TV show releases

6. **Best Picture Nominees 2024** (`reciFumBODcr3U6Mv`)
   - External ID: `streamtv_best_picture_nominees_2024`
   - Type: Rail of award-nominated content

7. **Classic kids shows** (`rec447TjC8iV4t1d9`)
   - External ID: `streamtv_classic_kids_shows`
   - Type: Rail of classic children's content

8. **Set Across the Pond (Europe)** (`receQ0EbarRXqOxZq`)
   - External ID: `streamtv_set_in_europe`
   - Type: Rail of Europe-based content

9. **Set Across the Pond (America)** (`recz5MA5pWbFbE1NI`)
   - External ID: `streamtv_set_in_america`
   - Type: Rail of America-based content

10. **Live Now** (`recyLr2KE6p3nN2jx`)
    - External ID: `streamtv_live_now`
    - Type: Rail of live/current content

11. **Spotlight movies** (`recjYrnRIeGV3waqj`)
    - External ID: `streamtv_spotlight_movies`
    - Type: Rail of featured movies

12. **Discover** (`recQjWUw20zmbSaD3`)
    - External ID: `streamtv_discover_collection`
    - Type: Discovery/exploration content

13. **Pedro Pascal Episodes** (`recNA9J6dzijaXhI9`)
    - External ID: `streamtv_pedro_pascal_episodes`
    - Type: Rail of Pedro Pascal content

14. **All TV Shows** (`rechEM6YXQxbfqBVr`)
    - External ID: `streamtv_all_tv_shows`
    - Type: Rail showing all available TV shows

### Individual Content Items:

15. **GOT Season 1** (`recNWXkYGdriyverR`)
    - Type: Individual season object

16. **Miraculous Season 5** (`recVPonxGDmSjKRcB`)
    - Type: Individual season object

## Set Type Structure

In the Airtable data, sets are structured with:
- `internal_title`: Display name used internally
- `skylark_object_type`: Always "SkylarkSet" for set objects
- `skylarkset_external_id`: Unique identifier following pattern `streamtv_[description]`
- `sets`: Array of parent sets this item belongs to
- Other metadata like availability, images, language, etc.

## Homepage Metadata

The homepage also has associated metadata entries in the `sets-metadata` table:
- `rec8HnbE26WU8nyZN` - English metadata
- `recU7MnWYNFuYSjOu` - Portuguese metadata  
- `recEwNMP9LBnbmnkw` - Spanish metadata

These provide localized titles and information for the homepage in different languages.