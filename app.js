const BASE_URL = 'https://api.harvardartmuseums.org';
const KEY = 'apikey=fd951dab-4e14-4223-8c3f-0ee78f19cca4'; // USE YOUR KEY HERE
let tempArr 

async function fetchObjects() {
    const url = `${ BASE_URL }/object?${ KEY }`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchAllCenturies() {
    const url = `${ BASE_URL }/century?${ KEY }&size=100&sort=temporalorder`;

    if (localStorage.getItem('centuries')) {
        return JSON.parse(localStorage.getItem('centuries'));
      }

    try {
      const response = await fetch(url);
      const data = await response.json();
      const records = data.records;

      localStorage.setItem('centuries', JSON.stringify(records));
  
      return records;
    } catch (error) {
      console.error(error);
    }
}

async function fetchAllClassifications() {
  const url = `${ BASE_URL }/classification?${ KEY }&size=100&sort=temporalorder`;

  if (localStorage.getItem('classifications')) {
      return JSON.parse(localStorage.getItem('classifications'));
    }

  try {
    const response = await fetch(url);
    const data = await response.json();
    const records = data.records;

    localStorage.setItem('classifications', JSON.stringify(records));

    return records;
  } catch (error) {
    console.error(error);
  }
}

async function prefetchCategoryLists() {

    try {
      const results = await Promise.all([
        fetchAllClassifications(),
        fetchAllCenturies()
      ]);
      
      const classifications = results[0];
      const centuries = results[1];

        // This provides a clue to the user, that there are items in the dropdown
$('.classification-count').text(`(${ classifications.length })`);

classifications.forEach(classification => {
  // append a correctly formatted option tag into
  // the element with id select-classification
  let newDiv = $(`<option value="${ classification.name }"> ${ classification.name } </option>`);
  $('#select-classification').append(newDiv);
});

// This provides a clue to the user, that there are items in the dropdown
$('.century-count').text(`(${ centuries.length }))`);

centuries.forEach(century => {
  // append a correctly formatted option tag into
  // the element with id select-century
  let newDiv = $(`<option value="${ century.name }"> ${ century.name } </option>`);
  $('#select-century').append(newDiv);
});

    } catch (error) {
      console.error(error);
    }
  }

  function buildSearchString() {
    const url1 = `${ BASE_URL }/object?${ KEY }`;
  
    const terms = [...$('#search select')].map(a => {
      return `${ $(a).attr('name') }=${ $(a).val() }`
    }).join('&');
    
    const keywords = `keyword=${ $('#keywords').val() }`;
  
    return `${ url1 }&${ terms }&${ keywords }`
  }

  $('#search').on('submit', async function (event) {
    // prevent the default
    event.preventDefault();
    onFetchStart();
  
    try {
      // get the url from `buildSearchString`
      // fetch it with await, store the result
      // log out both info and records when you get them
      const response = await fetch(buildSearchString());
      const { records, info } = await response.json(); 
      tempArr = { records, info} 
      console.log(tempArr)
      updatePreview(records, info);
    } catch (error) {
      // log out the error
      console.error(error);
    }
    finally {
      onFetchEnd();
    }
  });

  function onFetchStart() {
    $('#loading').addClass('active');
  }
  
  function onFetchEnd() {
    $('#loading').removeClass('active');
  }

  async function someFetchFunction() {
    onFetchStart();
  
    try {
      await fetch();
    } catch (error) {
      // error stuff
    } finally {
      onFetchEnd();
    }
  }

  function renderPreview(record) {
    // grab description, primaryimageurl, and title from the record
  
    /*
    Template looks like this:
  
    <div class="object-preview">
      <a href="#">
        <img src="image url" />
        <h3>Record Title</h3>
        <h3>Description</h3>
      </a>
    </div>
  
    Some of the items might be undefined, if so... don't render them
  
    With the record attached as data, with key 'record'
    */
   
   let newDiv = $(`<div class="object-preview">
   <a href="#">
     <img src="${ record.primaryimageurl }" />
     <h3 class="Title">${ record.title }</h3>
   </a>
 </div>`)

  return newDiv
  
  // return new element
  }
  
  
  function updatePreview(records, info) {
    const root = $('#preview');
    const next = root.find('.next')
    const previous = root.find('.previous')
    const results = root.find('.results')
  
    // grab the results element, it matches .results inside root
    // empty it
    // loop over the records, and append the renderPreview
    /*
    if info.next is present:
      - on the .next button set data with key url equal to info.next
      - also update the disabled attribute to false
    else
      - set the data url to null
      - update the disabled attribute to true


    Do the same for info.prev, with the .previous button
  */
    if (info.next){
      next.data('url', info.next)
      next.attr('disabled', false);
    } else {
      next.data('url', null)
      next.attr('disabled', true);
    }
    
    if (info.prev){
      previous.data('url', info.prev)
      previous.attr('disabled', false);
    } else {
      previous.data('url', null)
      previous.attr('disabled', true);
    }
    
    results.empty();
  
    records.forEach(a => {
      results.append(renderPreview(a));
    });
  }

  $('#preview .next, #preview .previous').on('click', async function () {
    /*
      read off url from the target 
      fetch the url
      read the records and info from the response.json()
      update the preview
    */
      onFetchStart();
  
      try {
        const url = $(this).data('url');
        const response = await fetch(url);
        const { records, info } = await response.json();  
        
        updatePreview(records, info);
      } catch (error) {
        console.error(error);
      } finally {
        onFetchEnd();
      }
  });

  $('#preview').on('click', '.object-preview', function (event) {
    event.preventDefault(); // they're anchor tags, so don't follow the link
    // find the '.object-preview' element by using .closest() from the target
    // recover the record from the element using the .data('record') we attached
    // log out the record object to see the shape of the data
    let a = true
    let b = $(this)[0].innerText
    let c = -1
    while(a){
      c = c + 1
    if(b === tempArr.records[c].title){
      a = false;
    }
  }
    console.log(c);
    const object = tempArr.records[c]
    console.log(object);
    const feature = $('#feature');

    feature.html( renderFeature(object) );
  });

  function renderFeature(record) {
    /**
     * We need to read, from record, the following:
     * HEADER: title, dated
     * FACTS: description, culture, style, technique, medium, dimensions, people, department, division, contact, creditline
     * PHOTOS: images, primaryimageurl
     */
  
    // build and return template

    const { 
      title, 
      dated,
      images,
      primaryimageurl,
      description,
      culture,
      style,
      technique,
      medium,
      dimensions,
      people,
      department,
      division,
      contact,
      creditline

    } = record;

    return $(`<div class="object-feature">
    <header>
    <h3>${ title }<h3>
    <h4>${ dated }</h4>
      </header>
      <section class="facts">
      <span>Description: ${ description }</span>
      <span>Culture: ${ culture }</span>
      <span>Style: ${ style }</span>
      <span>Technique: ${ technique }</span>
      <span>Medium: ${ medium }</span>
      <span>Dimensions: ${ dimensions }</span>
        <span>People: ${ people }</span>
        <span>Department: ${ department }</span>
        <span>Division: ${ division }</span>
        <span>Credit: ${ creditline }</span>
        <span>Contact: <a target="_blank" href="mailto:${ contact }">${ contact }</a></span>
      </section>
      <section class="photos">
        ${ photosHTML(images, primaryimageurl) }
      </section>
    </div>`);
  }

  function photosHTML(images, primaryimageurl) {
    // if images is defined AND images.length > 0, map the images to the correct image tags, then join them into a single string.  the images have a property called baseimageurl, use that as the value for src
    if (images.length > 0) {
        return images.map(
          image => `<img src="${ image.baseimageurl }" />`).join('');
      } else if (primaryimageurl) {
        return `<img src="${ primaryimageurl }" />`;
      } else {
        return '';
      }
    
    // else if primaryimageurl is defined, return a single image tag with that as value for src
  
    // else we have nothing, so return the empty string
  }

  $('#feature').on('click', 'a', async function (event) {
    // read href off of $(this) with the .attr() method
    const href = $(this).attr('href');
  
    if (href.startsWith('mailto:')) {
      return;
    }
  
     // prevent default
    event.preventDefault();
  
    // call onFetchStart
    // fetch the href
    // render it into the preview
    // call onFetchEnd
    onFetchStart();
    try {
      let response = await fetch(href);
      let { records, info } = await response.json();
      updatePreview(records, info);
    } catch (error) {
      console.error(error)
    } finally {
      onFetchEnd();
    }

  });
  
  fetchObjects().then(prefetchCategoryLists); // { info: {}, records: [{}, {},]}