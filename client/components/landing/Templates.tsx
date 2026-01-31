'use client'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'
import { useEffect, useRef } from 'react'
import Swiper from 'swiper'
import lightGallery from 'lightgallery'
import { Navigation, Pagination, Autoplay, Mousewheel } from 'swiper/modules';
import { SectionHeader } from './SectionHeader'

const Templates = () => {

  const swiperRef = useRef<HTMLDivElement | null>(null)
  const lgRef = useRef<HTMLDivElement | null>(null)
  const activeIndexRef = useRef(0)

  useEffect(() => {
    if (!swiperRef.current || !lgRef.current) return

    const swiper = new Swiper(swiperRef.current, {
        modules: [
            Navigation,
            Pagination,
            Autoplay,
            Mousewheel
        ],

        slidesPerView: 3,
        spaceBetween: 30,
        centeredSlides: true,
        loop: true,

        direction: 'horizontal',

        autoplay: {
            delay: 2500,
            pauseOnMouseEnter: true,
            disableOnInteraction: false,
        },

        mousewheel: {
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true,
        },

        effect: 'coverflow',
        grabCursor: true,

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },

        breakpoints: {
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
        },
        on: {
            init() {
                lightGallery(lgRef.current!, {
                    selector: '.swiper-slide',
                    plugins: [lgThumbnail, lgZoom],
                    speed: 500,
                })

                // Track active slide index safely
                lgRef.current!.addEventListener('lgAfterSlide', (e: any) => {
                    activeIndexRef.current = e.detail.index
                })

                // Use stored index when closing
                lgRef.current!.addEventListener('lgBeforeClose', () => {
                    swiper.slideTo(activeIndexRef.current, 0)
                })
            },
        },
    })

    return () => {
            swiper.destroy(true, true)
        }
    }, [])

  return (
    <section className='mycontainer py-20'>
        <SectionHeader badge='INVOICES & RECEIPTS' title='Choose from various invoice and receipt templetes' desc='Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sequi et hic sed ex quis nemo eum, numquam consequatur recusandae iste praesentium ratione sapiente aliquid dolore! Minima, incidunt. Asperiores, ducimus magni? Beatae at corrupti magni officiis iste incidunt, quis ratione quo harum et natus! Expedita voluptas repudiandae incidunt tempora dolores voluptate.'/>
        <div className="swiper-lg-wrap pt-8">
            <div className="swiper" ref={swiperRef}>
                <div className="swiper-wrapper" ref={lgRef}>
                    <a
                        className="swiper-slide shadow-xl"
                        href="/invoices/invoice1.webp"
                    >
                        <img src="/invoices/invoice1.webp" alt="" />
                    </a>

                    <a
                        className="swiper-slide shadow-xl"
                        href="/invoices/invoice2.webp"
                    >
                        <img src="/invoices/invoice2.webp" alt="" />
                    </a>

                    <a
                        className="swiper-slide shadow-xl"
                        href="/invoices/invoice3.webp"
                    >
                        <img src="/invoices/invoice3.webp" alt="" />
                    </a>

                    <a
                        className="swiper-slide shadow-xl"
                        href="/invoices/invoice4.webp"
                    >
                        <img src="/invoices/invoice4.webp" alt="" />
                    </a>
                    <a
                        className="swiper-slide shadow-xl"
                        href="/invoices/invoice4.webp"
                    >
                        <img src="/invoices/invoice4.webp" alt="" />
                    </a>
                    <a
                        className="swiper-slide shadow-xl"
                        href="/invoices/invoice4.webp"
                    >
                        <img src="/invoices/invoice4.webp" alt="" />
                    </a>
                    <a
                        className="swiper-slide shadow-xl"
                        href="/invoices/invoice4.webp"
                    >
                        <img src="/invoices/invoice4.webp" alt="" />
                    </a>

                </div>

                {/* <div className="swiper-button-prev" />
                <div className="swiper-button-next" /> */}
                <div className="swiper-pagination"></div>

            </div>
        </div>
    </section>
  )
}

export default Templates